/**
 * Production Real-Time Notification System
 * Firebase/WebPush integration with queue management
 */

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: NotificationAction[];
  priority: 'low' | 'normal' | 'high' | 'critical';
  patientId?: string;
  clinicianId?: string;
  category: 'patient_alert' | 'medication' | 'appointment' | 'emergency' | 'system';
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface NotificationQueue {
  id: string;
  payload: NotificationPayload;
  recipients: string[];
  scheduledTime?: number;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'sent' | 'failed' | 'scheduled';
}

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  vapidKey: string;
}

class RealTimeNotificationService {
  private notificationQueue: NotificationQueue[] = [];
  private firebaseApp: any = null;
  private messaging: any = null;
  private isInitialized = false;
  private queueProcessor: NodeJS.Timeout | null = null;
  private subscribers: { [token: string]: any } = {};

  constructor() {
    this.initializeFirebase();
    this.startQueueProcessor();
  }

  /**
   * Initialize Firebase messaging
   */
  private async initializeFirebase(): Promise<void> {
    try {
      // Dynamic import for Firebase (client-side only)
      if (typeof window !== 'undefined') {
        const { initializeApp } = await import('firebase/app');
        const { getMessaging, getToken, onMessage } = await import('firebase/messaging');

        const firebaseConfig: FirebaseConfig = {
          apiKey: process.env.VITE_FIREBASE_API_KEY || '',
          authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
          projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
          storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
          messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
          appId: process.env.VITE_FIREBASE_APP_ID || '',
          vapidKey: process.env.VITE_FIREBASE_VAPID_KEY || ''
        };

        this.firebaseApp = initializeApp(firebaseConfig);
        this.messaging = getMessaging(this.firebaseApp);
        
        // Listen for foreground messages
        onMessage(this.messaging, (payload) => {
          this.handleForegroundMessage(payload);
        });

        this.isInitialized = true;
        console.log('✅ Firebase messaging initialized');
      }
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
      // Fallback to browser notifications
      this.initializeBrowserNotifications();
    }
  }

  /**
   * Initialize browser notifications as fallback
   */
  private initializeBrowserNotifications(): void {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          console.log('Browser notification permission:', permission);
        });
      }
      this.isInitialized = true;
    }
  }

  /**
   * Request notification permission and get FCM token
   */
  async requestPermission(): Promise<string | null> {
    try {
      if (!this.isInitialized || !this.messaging) {
        throw new Error('Messaging not initialized');
      }

      const { getToken } = await import('firebase/messaging');
      const token = await getToken(this.messaging, {
        vapidKey: process.env.VITE_FIREBASE_VAPID_KEY
      });

      if (token) {
        console.log('FCM Token:', token);
        return token;
      } else {
        console.log('No registration token available');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Subscribe user to notifications
   */
  async subscribe(userId: string, deviceToken?: string): Promise<boolean> {
    try {
      const token = deviceToken || await this.requestPermission();
      if (!token) return false;

      this.subscribers[token] = {
        userId,
        token,
        subscribedAt: Date.now(),
        active: true
      };

      // Store subscription in backend
      await this.storeSubscription(userId, token);
      
      console.log(`✅ User ${userId} subscribed to notifications`);
      return true;
    } catch (error) {
      console.error('Subscription failed:', error);
      return false;
    }
  }

  /**
   * Send immediate notification
   */
  async sendNotification(
    recipients: string[],
    payload: NotificationPayload
  ): Promise<boolean> {
    const notificationId = this.generateNotificationId();
    
    const queueItem: NotificationQueue = {
      id: notificationId,
      payload,
      recipients,
      retryCount: 0,
      maxRetries: 3,
      status: 'pending'
    };

    // For critical notifications, send immediately
    if (payload.priority === 'critical') {
      return await this.processNotification(queueItem);
    }

    // Add to queue for batch processing
    this.notificationQueue.push(queueItem);
    return true;
  }

  /**
   * Schedule notification for later delivery
   */
  async scheduleNotification(
    recipients: string[],
    payload: NotificationPayload,
    scheduledTime: Date
  ): Promise<string> {
    const notificationId = this.generateNotificationId();
    
    const queueItem: NotificationQueue = {
      id: notificationId,
      payload,
      recipients,
      scheduledTime: scheduledTime.getTime(),
      retryCount: 0,
      maxRetries: 3,
      status: 'scheduled'
    };

    this.notificationQueue.push(queueItem);
    return notificationId;
  }

  /**
   * Send healthcare-specific notifications
   */
  async sendPatientAlert(
    patientId: string,
    clinicianIds: string[],
    alertType: 'vital_signs' | 'medication' | 'emergency' | 'appointment',
    message: string,
    data?: any
  ): Promise<boolean> {
    const payload: NotificationPayload = {
      title: this.getAlertTitle(alertType),
      body: message,
      icon: '/icons/medical-alert.png',
      priority: alertType === 'emergency' ? 'critical' : 'high',
      patientId,
      category: 'patient_alert',
      data: {
        alertType,
        patientId,
        timestamp: Date.now(),
        ...data
      },
      actions: [
        { action: 'view', title: 'View Details', icon: '/icons/view.png' },
        { action: 'acknowledge', title: 'Acknowledge', icon: '/icons/check.png' }
      ]
    };

    return await this.sendNotification(clinicianIds, payload);
  }

  /**
   * Send medication reminders
   */
  async sendMedicationReminder(
    patientId: string,
    medicationName: string,
    dosage: string,
    scheduledTime: Date
  ): Promise<boolean> {
    const payload: NotificationPayload = {
      title: 'Medication Reminder',
      body: `Time to take ${medicationName} - ${dosage}`,
      icon: '/icons/medication.png',
      priority: 'normal',
      patientId,
      category: 'medication',
      data: {
        medicationName,
        dosage,
        scheduledTime: scheduledTime.getTime(),
        patientId
      },
      actions: [
        { action: 'taken', title: 'Mark as Taken', icon: '/icons/check.png' },
        { action: 'snooze', title: 'Remind Later', icon: '/icons/snooze.png' }
      ]
    };

    return await this.scheduleNotification([patientId], payload, scheduledTime);
  }

  /**
   * Process notification queue
   */
  private startQueueProcessor(): void {
    this.queueProcessor = setInterval(async () => {
      await this.processQueue();
    }, 5000); // Process every 5 seconds
  }

  /**
   * Process queued notifications
   */
  private async processQueue(): Promise<void> {
    const now = Date.now();
    const toProcess = this.notificationQueue.filter(item => 
      (item.status === 'pending') || 
      (item.status === 'scheduled' && item.scheduledTime && item.scheduledTime <= now) ||
      (item.status === 'failed' && item.retryCount < item.maxRetries)
    );

    for (const item of toProcess) {
      await this.processNotification(item);
    }

    // Clean up processed notifications
    this.notificationQueue = this.notificationQueue.filter(item => 
      item.status !== 'sent' && 
      !(item.status === 'failed' && item.retryCount >= item.maxRetries)
    );
  }

  /**
   * Process individual notification
   */
  private async processNotification(item: NotificationQueue): Promise<boolean> {
    try {
      item.status = 'pending';

      // Send via Firebase if available
      if (this.isInitialized && this.messaging) {
        await this.sendViaFirebase(item);
      } else {
        // Fallback to browser notifications
        await this.sendViaBrowser(item);
      }

      item.status = 'sent';
      console.log(`✅ Notification sent: ${item.id}`);
      return true;

    } catch (error) {
      console.error(`❌ Notification failed: ${item.id}`, error);
      item.retryCount++;
      item.status = item.retryCount >= item.maxRetries ? 'failed' : 'pending';
      return false;
    }
  }

  /**
   * Send notification via Firebase
   */
  private async sendViaFirebase(item: NotificationQueue): Promise<void> {
    // This would typically be done server-side
    // For client-side, we'll use the service worker
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(item.payload.title, {
        body: item.payload.body,
        icon: item.payload.icon,
        badge: item.payload.badge,
        image: item.payload.image,
        data: item.payload.data,
        actions: item.payload.actions,
        requireInteraction: item.payload.priority === 'critical',
        silent: item.payload.priority === 'low'
      });
    }
  }

  /**
   * Send notification via browser API
   */
  private async sendViaBrowser(item: NotificationQueue): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(item.payload.title, {
        body: item.payload.body,
        icon: item.payload.icon,
        badge: item.payload.badge,
        image: item.payload.image,
        data: item.payload.data,
        requireInteraction: item.payload.priority === 'critical',
        silent: item.payload.priority === 'low'
      });

      notification.onclick = () => {
        this.handleNotificationClick(item.payload);
      };
    }
  }

  /**
   * Handle foreground messages
   */
  private handleForegroundMessage(payload: any): void {
    console.log('Foreground message received:', payload);
    
    // Show custom in-app notification
    this.showInAppNotification(payload);
  }

  /**
   * Show in-app notification
   */
  private showInAppNotification(payload: any): void {
    // Create custom notification UI element
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-white border-l-4 border-blue-500 rounded-lg shadow-lg p-4 max-w-sm z-50';
    notification.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="ml-3 w-0 flex-1">
          <p class="text-sm font-medium text-gray-900">${payload.notification?.title || 'Notification'}</p>
          <p class="mt-1 text-sm text-gray-500">${payload.notification?.body || ''}</p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500" onclick="this.parentElement.parentElement.parentElement.remove()">
            <span class="sr-only">Close</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  /**
   * Handle notification click
   */
  private handleNotificationClick(payload: NotificationPayload): void {
    // Navigate to relevant page based on notification category
    const baseUrl = window.location.origin;
    let targetUrl = baseUrl;

    switch (payload.category) {
      case 'patient_alert':
        targetUrl = `${baseUrl}/patients/${payload.patientId}`;
        break;
      case 'medication':
        targetUrl = `${baseUrl}/medications`;
        break;
      case 'appointment':
        targetUrl = `${baseUrl}/appointments`;
        break;
      case 'emergency':
        targetUrl = `${baseUrl}/emergency`;
        break;
      default:
        targetUrl = `${baseUrl}/dashboard`;
    }

    window.focus();
    window.location.href = targetUrl;
  }

  /**
   * Store subscription in backend
   */
  private async storeSubscription(userId: string, token: string): Promise<void> {
    try {
      // This would typically call your backend API
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          token,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to store subscription');
      }
    } catch (error) {
      console.error('Failed to store subscription:', error);
      // Store locally as fallback
      localStorage.setItem(`notification_subscription_${userId}`, JSON.stringify({
        token,
        timestamp: Date.now()
      }));
    }
  }

  /**
   * Get alert title based on type
   */
  private getAlertTitle(alertType: string): string {
    const titles = {
      vital_signs: 'Vital Signs Alert',
      medication: 'Medication Alert',
      emergency: 'EMERGENCY ALERT',
      appointment: 'Appointment Reminder'
    };
    return titles[alertType as keyof typeof titles] || 'Healthcare Alert';
  }

  /**
   * Generate unique notification ID
   */
  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get notification queue status
   */
  getQueueStatus() {
    return {
      totalQueued: this.notificationQueue.length,
      pending: this.notificationQueue.filter(n => n.status === 'pending').length,
      scheduled: this.notificationQueue.filter(n => n.status === 'scheduled').length,
      failed: this.notificationQueue.filter(n => n.status === 'failed').length,
      subscribers: Object.keys(this.subscribers).length
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.queueProcessor) {
      clearInterval(this.queueProcessor);
      this.queueProcessor = null;
    }
    this.notificationQueue = [];
    this.subscribers = {};
  }
}

// Singleton instance
const notificationService = new RealTimeNotificationService();

export default notificationService;
export { RealTimeNotificationService, NotificationPayload };