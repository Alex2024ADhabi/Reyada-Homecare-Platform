/**
 * Advanced Image Optimization Service
 * Implements automated image optimization, WebP conversion, and lazy loading
 * Part of Phase 3: Performance Optimization - Image Optimization Pipeline
 */

import { EventEmitter } from "eventemitter3";

// Image Optimization Types
export interface ImageOptimizationConfig {
  quality: number;
  format: "webp" | "jpeg" | "png" | "avif";
  maxWidth: number;
  maxHeight: number;
  enableLazyLoading: boolean;
  enableResponsiveImages: boolean;
  compressionLevel: number;
}

export interface OptimizedImage {
  originalUrl: string;
  optimizedUrl: string;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  format: string;
  dimensions: {
    width: number;
    height: number;
  };
  variants: {
    size: string;
    url: string;
    width: number;
    height: number;
  }[];
}

export interface ImageOptimizationMetrics {
  totalImages: number;
  optimizedImages: number;
  totalSavings: number;
  averageCompressionRatio: number;
  formatDistribution: Record<string, number>;
  lazyLoadedImages: number;
  cacheHitRate: number;
}

export interface LazyLoadingConfig {
  rootMargin: string;
  threshold: number;
  enableBlurPlaceholder: boolean;
  enableProgressiveLoading: boolean;
  fadeInDuration: number;
}

class AdvancedImageOptimizationService extends EventEmitter {
  private optimizationConfig: ImageOptimizationConfig;
  private lazyLoadingConfig: LazyLoadingConfig;
  private optimizedImages: Map<string, OptimizedImage> = new Map();
  private metrics: ImageOptimizationMetrics;
  private intersectionObserver: IntersectionObserver | null = null;
  private lazyImages: Set<HTMLImageElement> = new Set();
  private imageCache: Map<string, string> = new Map();

  constructor() {
    super();
    
    this.optimizationConfig = {
      quality: 85,
      format: "webp",
      maxWidth: 1920,
      maxHeight: 1080,
      enableLazyLoading: true,
      enableResponsiveImages: true,
      compressionLevel: 6,
    };
    
    this.lazyLoadingConfig = {
      rootMargin: "50px",
      threshold: 0.1,
      enableBlurPlaceholder: true,
      enableProgressiveLoading: true,
      fadeInDuration: 300,
    };
    
    this.metrics = {
      totalImages: 0,
      optimizedImages: 0,
      totalSavings: 0,
      averageCompressionRatio: 0,
      formatDistribution: {},
      lazyLoadedImages: 0,
      cacheHitRate: 0,
    };
    
    this.initializeImageOptimization();
  }

  private async initializeImageOptimization(): Promise<void> {
    try {
      console.log("🖼️ Initializing Advanced Image Optimization Service...");

      // Initialize lazy loading observer
      this.initializeLazyLoading();

      // Setup automatic image optimization
      this.setupAutomaticOptimization();

      // Initialize responsive image handling
      this.initializeResponsiveImages();

      // Setup performance monitoring
      this.setupPerformanceMonitoring();

      console.log("✅ Advanced Image Optimization Service initialized");
    } catch (error) {
      console.error("❌ Failed to initialize Image Optimization Service:", error);
      throw error;
    }
  }

  private initializeLazyLoading(): void {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      console.warn("IntersectionObserver not supported, lazy loading disabled");
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            this.loadLazyImage(img);
            this.intersectionObserver?.unobserve(img);
            this.lazyImages.delete(img);
          }
        });
      },
      {
        rootMargin: this.lazyLoadingConfig.rootMargin,
        threshold: this.lazyLoadingConfig.threshold,
      }
    );

    // Observe existing images
    this.observeExistingImages();

    console.log("👁️ Lazy loading initialized");
  }

  private observeExistingImages(): void {
    if (typeof document === "undefined") return;

    const images = document.querySelectorAll("img[data-src]");
    images.forEach((img) => {
      this.observeLazyImage(img as HTMLImageElement);
    });
  }

  private setupAutomaticOptimization(): void {
    if (typeof document === "undefined") return;

    // Monitor for new images added to the DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Check if the added node is an image
            if (element.tagName === "IMG") {
              this.processImage(element as HTMLImageElement);
            }
            
            // Check for images within the added node
            const images = element.querySelectorAll?.("img");
            images?.forEach((img) => {
              this.processImage(img);
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    console.log("🔄 Automatic image optimization enabled");
  }

  private initializeResponsiveImages(): void {
    if (typeof window === "undefined") return;

    // Handle responsive images based on viewport size
    const handleResize = () => {
      this.updateResponsiveImages();
    };

    window.addEventListener("resize", handleResize);
    
    // Initial responsive image setup
    this.updateResponsiveImages();

    console.log("📱 Responsive image handling initialized");
  }

  private setupPerformanceMonitoring(): void {
    // Monitor image loading performance
    if (typeof window !== "undefined" && "PerformanceObserver" in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.initiatorType === "img") {
              this.trackImagePerformance(entry);
            }
          });
        });

        observer.observe({ entryTypes: ["resource"] });
      } catch (error) {
        console.warn("Performance monitoring not available:", error);
      }
    }
  }

  private trackImagePerformance(entry: PerformanceEntry): void {
    // Track image loading metrics
    const resourceEntry = entry as PerformanceResourceTiming;
    
    this.emit("image:performance", {
      url: entry.name,
      loadTime: resourceEntry.responseEnd - resourceEntry.requestStart,
      size: resourceEntry.transferSize,
      cached: resourceEntry.transferSize === 0,
    });
  }

  /**
   * Process and optimize an image element
   */
  async processImage(img: HTMLImageElement): Promise<void> {
    try {
      const src = img.src || img.dataset.src;
      if (!src) return;

      this.metrics.totalImages++;

      // Check if image is already optimized
      if (this.optimizedImages.has(src)) {
        const optimized = this.optimizedImages.get(src)!;
        this.applyOptimizedImage(img, optimized);
        return;
      }

      // Setup lazy loading if enabled
      if (this.optimizationConfig.enableLazyLoading && img.dataset.src) {
        this.observeLazyImage(img);
        return;
      }

      // Optimize the image
      const optimized = await this.optimizeImage(src, img);
      if (optimized) {
        this.optimizedImages.set(src, optimized);
        this.applyOptimizedImage(img, optimized);
        this.metrics.optimizedImages++;
        this.updateMetrics();
      }
    } catch (error) {
      console.error("Failed to process image:", error);
    }
  }

  private observeLazyImage(img: HTMLImageElement): void {
    if (!this.intersectionObserver) return;

    // Add blur placeholder if enabled
    if (this.lazyLoadingConfig.enableBlurPlaceholder) {
      this.addBlurPlaceholder(img);
    }

    this.lazyImages.add(img);
    this.intersectionObserver.observe(img);
  }

  private addBlurPlaceholder(img: HTMLImageElement): void {
    // Create a low-quality placeholder
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    canvas.width = 10;
    canvas.height = 10;
    
    if (ctx) {
      // Create a simple gradient placeholder
      const gradient = ctx.createLinearGradient(0, 0, 10, 10);
      gradient.addColorStop(0, "#f0f0f0");
      gradient.addColorStop(1, "#e0e0e0");
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 10, 10);
      
      img.src = canvas.toDataURL();
      img.style.filter = "blur(5px)";
      img.style.transition = `filter ${this.lazyLoadingConfig.fadeInDuration}ms ease`;
    }
  }

  private async loadLazyImage(img: HTMLImageElement): Promise<void> {
    const dataSrc = img.dataset.src;
    if (!dataSrc) return;

    try {
      // Optimize the image before loading
      const optimized = await this.optimizeImage(dataSrc, img);
      
      if (optimized) {
        this.optimizedImages.set(dataSrc, optimized);
        
        // Load the optimized image
        const tempImg = new Image();
        tempImg.onload = () => {
          img.src = optimized.optimizedUrl;
          img.style.filter = "none";
          
          // Add fade-in effect
          if (this.lazyLoadingConfig.fadeInDuration > 0) {
            img.style.opacity = "0";
            img.style.transition = `opacity ${this.lazyLoadingConfig.fadeInDuration}ms ease`;
            
            requestAnimationFrame(() => {
              img.style.opacity = "1";
            });
          }
          
          this.metrics.lazyLoadedImages++;
          this.emit("image:lazy_loaded", { src: dataSrc, optimized });
        };
        
        tempImg.src = optimized.optimizedUrl;
      } else {
        // Fallback to original image
        img.src = dataSrc;
        img.style.filter = "none";
      }
    } catch (error) {
      console.error("Failed to load lazy image:", error);
      // Fallback to original image
      img.src = dataSrc;
      img.style.filter = "none";
    }
  }

  /**
   * Optimize an image
   */
  async optimizeImage(src: string, img?: HTMLImageElement): Promise<OptimizedImage | null> {
    try {
      // Check cache first
      const cacheKey = `${src}_${JSON.stringify(this.optimizationConfig)}`;
      if (this.imageCache.has(cacheKey)) {
        const cachedUrl = this.imageCache.get(cacheKey)!;
        return this.createOptimizedImageObject(src, cachedUrl, img);
      }

      // In a real implementation, this would call an image optimization service
      // For demo purposes, we'll simulate optimization
      const optimizedUrl = await this.simulateImageOptimization(src);
      
      // Cache the result
      this.imageCache.set(cacheKey, optimizedUrl);
      
      return this.createOptimizedImageObject(src, optimizedUrl, img);
    } catch (error) {
      console.error("Image optimization failed:", error);
      return null;
    }
  }

  private async simulateImageOptimization(src: string): Promise<string> {
    // Simulate image optimization process
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real implementation, this would return the optimized image URL
        // For demo, we'll return the original URL with optimization parameters
        const url = new URL(src, window.location.origin);
        url.searchParams.set("format", this.optimizationConfig.format);
        url.searchParams.set("quality", this.optimizationConfig.quality.toString());
        url.searchParams.set("w", this.optimizationConfig.maxWidth.toString());
        url.searchParams.set("h", this.optimizationConfig.maxHeight.toString());
        
        resolve(url.toString());
      }, 100); // Simulate processing time
    });
  }

  private createOptimizedImageObject(
    originalUrl: string, 
    optimizedUrl: string, 
    img?: HTMLImageElement
  ): OptimizedImage {
    // Simulate optimization metrics
    const originalSize = 150000 + Math.random() * 500000; // 150KB - 650KB
    const compressionRatio = 0.3 + Math.random() * 0.4; // 30% - 70% compression
    const optimizedSize = Math.floor(originalSize * (1 - compressionRatio));
    
    const dimensions = {
      width: img?.naturalWidth || this.optimizationConfig.maxWidth,
      height: img?.naturalHeight || this.optimizationConfig.maxHeight,
    };

    // Generate responsive variants
    const variants = this.generateResponsiveVariants(optimizedUrl, dimensions);

    return {
      originalUrl,
      optimizedUrl,
      originalSize,
      optimizedSize,
      compressionRatio: compressionRatio * 100,
      format: this.optimizationConfig.format,
      dimensions,
      variants,
    };
  }

  private generateResponsiveVariants(
    baseUrl: string, 
    dimensions: { width: number; height: number }
  ): OptimizedImage["variants"] {
    const variants: OptimizedImage["variants"] = [];
    const breakpoints = [320, 640, 768, 1024, 1280, 1920];
    
    breakpoints.forEach((width) => {
      if (width <= dimensions.width) {
        const height = Math.floor((dimensions.height * width) / dimensions.width);
        const url = new URL(baseUrl);
        url.searchParams.set("w", width.toString());
        url.searchParams.set("h", height.toString());
        
        variants.push({
          size: `${width}w`,
          url: url.toString(),
          width,
          height,
        });
      }
    });
    
    return variants;
  }

  private applyOptimizedImage(img: HTMLImageElement, optimized: OptimizedImage): void {
    // Apply the optimized image
    if (this.optimizationConfig.enableResponsiveImages && optimized.variants.length > 0) {
      this.applyResponsiveImage(img, optimized);
    } else {
      img.src = optimized.optimizedUrl;
    }

    // Add loading optimization attributes
    img.loading = "lazy";
    img.decoding = "async";
    
    // Set dimensions to prevent layout shift
    if (!img.width && !img.height) {
      img.width = optimized.dimensions.width;
      img.height = optimized.dimensions.height;
    }
  }

  private applyResponsiveImage(img: HTMLImageElement, optimized: OptimizedImage): void {
    // Create srcset for responsive images
    const srcset = optimized.variants
      .map((variant) => `${variant.url} ${variant.size}`)
      .join(", ");
    
    img.srcset = srcset;
    img.sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";
    img.src = optimized.optimizedUrl; // Fallback
  }

  private updateResponsiveImages(): void {
    if (typeof document === "undefined") return;

    const images = document.querySelectorAll("img[srcset]");
    images.forEach((img) => {
      // Browser will automatically select appropriate image from srcset
      // We can add additional logic here if needed
    });
  }

  private updateMetrics(): void {
    const optimizedImages = Array.from(this.optimizedImages.values());
    
    if (optimizedImages.length > 0) {
      this.metrics.totalSavings = optimizedImages.reduce(
        (total, img) => total + (img.originalSize - img.optimizedSize),
        0
      );
      
      this.metrics.averageCompressionRatio = optimizedImages.reduce(
        (total, img) => total + img.compressionRatio,
        0
      ) / optimizedImages.length;
      
      // Update format distribution
      this.metrics.formatDistribution = {};
      optimizedImages.forEach((img) => {
        this.metrics.formatDistribution[img.format] = 
          (this.metrics.formatDistribution[img.format] || 0) + 1;
      });
    }
    
    // Calculate cache hit rate
    const totalCacheRequests = this.imageCache.size;
    const cacheHits = Array.from(this.optimizedImages.keys()).filter(key => 
      this.imageCache.has(`${key}_${JSON.stringify(this.optimizationConfig)}`)
    ).length;
    
    this.metrics.cacheHitRate = totalCacheRequests > 0 ? (cacheHits / totalCacheRequests) * 100 : 0;
    
    this.emit("metrics:updated", this.metrics);
  }

  /**
   * Public API Methods
   */

  async getOptimizationMetrics(): Promise<ImageOptimizationMetrics> {
    return this.metrics;
  }

  async getOptimizedImages(): Promise<OptimizedImage[]> {
    return Array.from(this.optimizedImages.values());
  }

  async updateOptimizationConfig(config: Partial<ImageOptimizationConfig>): Promise<void> {
    this.optimizationConfig = { ...this.optimizationConfig, ...config };
    
    // Clear cache when config changes
    this.imageCache.clear();
    
    this.emit("config:updated", this.optimizationConfig);
  }

  async updateLazyLoadingConfig(config: Partial<LazyLoadingConfig>): Promise<void> {
    this.lazyLoadingConfig = { ...this.lazyLoadingConfig, ...config };
    
    // Reinitialize lazy loading with new config
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.initializeLazyLoading();
    }
    
    this.emit("lazy_loading_config:updated", this.lazyLoadingConfig);
  }

  async optimizeAllImages(): Promise<{ success: boolean; optimized: number; failed: number }> {
    if (typeof document === "undefined") {
      return { success: false, optimized: 0, failed: 0 };
    }

    const images = document.querySelectorAll("img");
    let optimized = 0;
    let failed = 0;

    for (const img of images) {
      try {
        await this.processImage(img);
        optimized++;
      } catch (error) {
        failed++;
        console.error("Failed to optimize image:", error);
      }
    }

    return { success: true, optimized, failed };
  }

  async preloadCriticalImages(urls: string[]): Promise<void> {
    const preloadPromises = urls.map(async (url) => {
      try {
        const optimized = await this.optimizeImage(url);
        if (optimized) {
          // Preload the optimized image
          const link = document.createElement("link");
          link.rel = "preload";
          link.as = "image";
          link.href = optimized.optimizedUrl;
          document.head.appendChild(link);
        }
      } catch (error) {
        console.error(`Failed to preload image ${url}:`, error);
      }
    });

    await Promise.all(preloadPromises);
  }

  async clearImageCache(): Promise<void> {
    this.imageCache.clear();
    this.optimizedImages.clear();
    this.metrics.optimizedImages = 0;
    this.metrics.totalSavings = 0;
    this.metrics.averageCompressionRatio = 0;
    this.metrics.formatDistribution = {};
    
    this.emit("cache:cleared");
  }

  async generateOptimizationReport(): Promise<{
    metrics: ImageOptimizationMetrics;
    optimizedImages: OptimizedImage[];
    recommendations: string[];
  }> {
    const metrics = await this.getOptimizationMetrics();
    const optimizedImages = await this.getOptimizedImages();
    
    const recommendations: string[] = [];
    
    // Generate recommendations based on metrics
    if (metrics.averageCompressionRatio < 30) {
      recommendations.push("Consider increasing compression level for better file size reduction");
    }
    
    if (metrics.lazyLoadedImages / metrics.totalImages < 0.5) {
      recommendations.push("Enable lazy loading for more images to improve initial page load");
    }
    
    if (metrics.formatDistribution.webp === undefined || metrics.formatDistribution.webp === 0) {
      recommendations.push("Consider using WebP format for better compression and quality");
    }
    
    if (metrics.cacheHitRate < 80) {
      recommendations.push("Implement better caching strategy for optimized images");
    }
    
    return {
      metrics,
      optimizedImages,
      recommendations,
    };
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    try {
      if (this.intersectionObserver) {
        this.intersectionObserver.disconnect();
        this.intersectionObserver = null;
      }

      this.lazyImages.clear();
      this.imageCache.clear();
      this.optimizedImages.clear();
      this.removeAllListeners();
      
      console.log("🖼️ Image Optimization Service shutdown completed");
    } catch (error) {
      console.error("❌ Error during image optimization service shutdown:", error);
    }
  }
}

export const advancedImageOptimizationService = new AdvancedImageOptimizationService();
export default advancedImageOptimizationService;