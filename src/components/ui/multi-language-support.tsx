import React, { createContext, useContext, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Languages, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Language definitions
export type Language = "en" | "ar";

export interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    rtl: false,
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇦🇪",
    rtl: true,
  },
];

// Translation interface
export interface Translations {
  [key: string]: string | Translations;
}

// Default translations
const DEFAULT_TRANSLATIONS: Record<Language, Translations> = {
  en: {
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      search: "Search",
      filter: "Filter",
      export: "Export",
      import: "Import",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      warning: "Warning",
      info: "Information",
      yes: "Yes",
      no: "No",
      ok: "OK",
      close: "Close",
      back: "Back",
      next: "Next",
      previous: "Previous",
      submit: "Submit",
      reset: "Reset",
      clear: "Clear",
      select: "Select",
      required: "Required",
      optional: "Optional",
      date: "Date",
      time: "Time",
      name: "Name",
      email: "Email",
      phone: "Phone",
      address: "Address",
      status: "Status",
      active: "Active",
      inactive: "Inactive",
      pending: "Pending",
      completed: "Completed",
      failed: "Failed",
      approved: "Approved",
      rejected: "Rejected",
    },
    navigation: {
      dashboard: "Dashboard",
      patients: "Patients",
      episodes: "Episodes",
      clinical: "Clinical",
      forms: "Forms",
      reports: "Reports",
      compliance: "Compliance",
      settings: "Settings",
      profile: "Profile",
      logout: "Logout",
    },
    patient: {
      title: "Patient Management",
      add: "Add Patient",
      edit: "Edit Patient",
      view: "View Patient",
      search: "Search Patients",
      emiratesId: "Emirates ID",
      mrn: "Medical Record Number",
      firstName: "First Name",
      lastName: "Last Name",
      dateOfBirth: "Date of Birth",
      gender: "Gender",
      nationality: "Nationality",
      insurance: "Insurance Information",
      medicalHistory: "Medical History",
      allergies: "Allergies",
      medications: "Current Medications",
      emergencyContact: "Emergency Contact",
    },
    clinical: {
      title: "Clinical Documentation",
      assessment: "Assessment",
      planOfCare: "Plan of Care",
      progress: "Progress Notes",
      discharge: "Discharge Summary",
      nineDomainsAssessment: "9-Domain DOH Assessment",
      electronicSignature: "Electronic Signature",
      complianceCheck: "Compliance Check",
      domains: {
        patientSafety: "Patient Safety",
        clinicalGovernance: "Clinical Governance",
        qualityManagement: "Quality Management",
        riskManagement: "Risk Management",
        humanResources: "Human Resources",
        informationManagement: "Information Management",
        facilitiesManagement: "Facilities Management",
        patientExperience: "Patient Experience",
        continuousImprovement: "Continuous Improvement",
      },
    },
    daman: {
      title: "Daman Claims",
      submission: "Claim Submission",
      authorization: "Authorization",
      preApproval: "Pre-approval",
      claimNumber: "Claim Number",
      serviceDate: "Service Date",
      serviceCodes: "Service Codes",
      amount: "Amount",
      authorizationNumber: "Authorization Number",
      status: "Claim Status",
      submitted: "Submitted",
      approved: "Approved",
      denied: "Denied",
      processing: "Processing",
    },
    reports: {
      title: "Reports & Analytics",
      generate: "Generate Report",
      schedule: "Schedule Report",
      export: "Export Report",
      template: "Report Template",
      category: "Category",
      dateRange: "Date Range",
      format: "Format",
      recipients: "Recipients",
      frequency: "Frequency",
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      quarterly: "Quarterly",
      annually: "Annually",
    },
    compliance: {
      title: "DOH Compliance",
      status: "Compliance Status",
      compliant: "Compliant",
      nonCompliant: "Non-Compliant",
      pendingReview: "Pending Review",
      auditTrail: "Audit Trail",
      documentation: "Documentation",
      requirements: "Requirements",
      standards: "Standards",
      monitoring: "Monitoring",
    },
    mobile: {
      installApp: "Install Mobile App",
      offlineMode: "Offline Mode",
      syncData: "Sync Data",
      cameraAccess: "Camera Access",
      voiceInput: "Voice Input",
      touchOptimized: "Touch Optimized",
      hapticFeedback: "Haptic Feedback",
    },
  },
  ar: {
    common: {
      save: "حفظ",
      cancel: "إلغاء",
      delete: "حذف",
      edit: "تعديل",
      add: "إضافة",
      search: "بحث",
      filter: "تصفية",
      export: "تصدير",
      import: "استيراد",
      loading: "جاري التحميل...",
      error: "خطأ",
      success: "نجح",
      warning: "تحذير",
      info: "معلومات",
      yes: "نعم",
      no: "لا",
      ok: "موافق",
      close: "إغلاق",
      back: "رجوع",
      next: "التالي",
      previous: "السابق",
      submit: "إرسال",
      reset: "إعادة تعيين",
      clear: "مسح",
      select: "اختيار",
      required: "مطلوب",
      optional: "اختياري",
      date: "التاريخ",
      time: "الوقت",
      name: "الاسم",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      address: "العنوان",
      status: "الحالة",
      active: "نشط",
      inactive: "غير نشط",
      pending: "في الانتظار",
      completed: "مكتمل",
      failed: "فشل",
      approved: "موافق عليه",
      rejected: "مرفوض",
    },
    navigation: {
      dashboard: "لوحة التحكم",
      patients: "المرضى",
      episodes: "الحلقات",
      clinical: "السريري",
      forms: "النماذج",
      reports: "التقارير",
      compliance: "الامتثال",
      settings: "الإعدادات",
      profile: "الملف الشخصي",
      logout: "تسجيل الخروج",
    },
    patient: {
      title: "إدارة المرضى",
      add: "إضافة مريض",
      edit: "تعديل المريض",
      view: "عرض المريض",
      search: "البحث عن المرضى",
      emiratesId: "الهوية الإماراتية",
      mrn: "رقم السجل الطبي",
      firstName: "الاسم الأول",
      lastName: "اسم العائلة",
      dateOfBirth: "تاريخ الميلاد",
      gender: "الجنس",
      nationality: "الجنسية",
      insurance: "معلومات التأمين",
      medicalHistory: "التاريخ الطبي",
      allergies: "الحساسية",
      medications: "الأدوية الحالية",
      emergencyContact: "جهة الاتصال في حالات الطوارئ",
    },
    clinical: {
      title: "التوثيق السريري",
      assessment: "التقييم",
      planOfCare: "خطة الرعاية",
      progress: "ملاحظات التقدم",
      discharge: "ملخص الخروج",
      nineDomainsAssessment: "تقييم المجالات التسعة لوزارة الصحة",
      electronicSignature: "التوقيع الإلكتروني",
      complianceCheck: "فحص الامتثال",
      domains: {
        patientSafety: "سلامة المرضى",
        clinicalGovernance: "الحوكمة السريرية",
        qualityManagement: "إدارة الجودة",
        riskManagement: "إدارة المخاطر",
        humanResources: "الموارد البشرية",
        informationManagement: "إدارة المعلومات",
        facilitiesManagement: "إدارة المرافق",
        patientExperience: "تجربة المريض",
        continuousImprovement: "التحسين المستمر",
      },
    },
    daman: {
      title: "مطالبات ضمان",
      submission: "تقديم المطالبة",
      authorization: "التفويض",
      preApproval: "الموافقة المسبقة",
      claimNumber: "رقم المطالبة",
      serviceDate: "تاريخ الخدمة",
      serviceCodes: "رموز الخدمة",
      amount: "المبلغ",
      authorizationNumber: "رقم التفويض",
      status: "حالة المطالبة",
      submitted: "مقدم",
      approved: "موافق عليه",
      denied: "مرفوض",
      processing: "قيد المعالجة",
    },
    reports: {
      title: "التقارير والتحليلات",
      generate: "إنشاء تقرير",
      schedule: "جدولة التقرير",
      export: "تصدير التقرير",
      template: "قالب التقرير",
      category: "الفئة",
      dateRange: "نطاق التاريخ",
      format: "التنسيق",
      recipients: "المستلمون",
      frequency: "التكرار",
      daily: "يومي",
      weekly: "أسبوعي",
      monthly: "شهري",
      quarterly: "ربع سنوي",
      annually: "سنوي",
    },
    compliance: {
      title: "امتثال وزارة الصحة",
      status: "حالة الامتثال",
      compliant: "متوافق",
      nonCompliant: "غير متوافق",
      pendingReview: "في انتظار المراجعة",
      auditTrail: "مسار التدقيق",
      documentation: "التوثيق",
      requirements: "المتطلبات",
      standards: "المعايير",
      monitoring: "المراقبة",
    },
    mobile: {
      installApp: "تثبيت التطبيق المحمول",
      offlineMode: "وضع عدم الاتصال",
      syncData: "مزامنة البيانات",
      cameraAccess: "الوصول للكاميرا",
      voiceInput: "الإدخال الصوتي",
      touchOptimized: "محسن للمس",
      hapticFeedback: "ردود الفعل اللمسية",
    },
  },
};

// Language Context
interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
  isRTL: boolean;
  availableLanguages: LanguageConfig[];
  translations: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

// Language Provider
interface LanguageProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
  customTranslations?: Record<Language, Translations>;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  defaultLanguage = "en",
  customTranslations,
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    // Check localStorage for saved language preference
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("reyada-language");
      if (saved && (saved === "en" || saved === "ar")) {
        return saved as Language;
      }
    }
    return defaultLanguage;
  });

  const [translations, setTranslations] = useState<
    Record<Language, Translations>
  >(customTranslations || DEFAULT_TRANSLATIONS);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    if (typeof window !== "undefined") {
      localStorage.setItem("reyada-language", language);
      // Update document direction and language
      document.documentElement.dir = SUPPORTED_LANGUAGES.find(
        (l) => l.code === language,
      )?.rtl
        ? "rtl"
        : "ltr";
      document.documentElement.lang = language;
    }
  };

  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split(".");
    let value: any = translations[currentLanguage];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === "object" && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if not found in fallback
          }
        }
        break;
      }
    }

    if (typeof value !== "string") {
      return key;
    }

    // Replace parameters
    if (params) {
      return Object.entries(params).reduce(
        (str, [paramKey, paramValue]) =>
          str.replace(new RegExp(`{{${paramKey}}}`, "g"), paramValue),
        value,
      );
    }

    return value;
  };

  const isRTL =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage)?.rtl || false;

  useEffect(() => {
    // Set initial document direction and language
    if (typeof window !== "undefined") {
      document.documentElement.dir = isRTL ? "rtl" : "ltr";
      document.documentElement.lang = currentLanguage;
    }
  }, [currentLanguage, isRTL]);

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    isRTL,
    availableLanguages: SUPPORTED_LANGUAGES,
    translations: translations[currentLanguage],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Language Selector Component
interface LanguageSelectorProps {
  variant?: "dropdown" | "select" | "buttons";
  showFlag?: boolean;
  showNativeName?: boolean;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = "dropdown",
  showFlag = true,
  showNativeName = true,
  className,
}) => {
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();

  const currentLangConfig = availableLanguages.find(
    (l) => l.code === currentLanguage,
  );

  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("gap-2", className)}
          >
            <Globe className="h-4 w-4" />
            {showFlag && currentLangConfig?.flag}
            {showNativeName
              ? currentLangConfig?.nativeName
              : currentLangConfig?.name}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {availableLanguages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className="gap-2"
            >
              {showFlag && <span>{lang.flag}</span>}
              <span>{showNativeName ? lang.nativeName : lang.name}</span>
              {currentLanguage === lang.code && (
                <Check className="h-4 w-4 ml-auto" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === "select") {
    return (
      <Select value={currentLanguage} onValueChange={setLanguage}>
        <SelectTrigger className={cn("w-auto gap-2", className)}>
          <SelectValue>
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              {showFlag && currentLangConfig?.flag}
              {showNativeName
                ? currentLangConfig?.nativeName
                : currentLangConfig?.name}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableLanguages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center gap-2">
                {showFlag && <span>{lang.flag}</span>}
                <span>{showNativeName ? lang.nativeName : lang.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (variant === "buttons") {
    return (
      <div className={cn("flex gap-1", className)}>
        {availableLanguages.map((lang) => (
          <Button
            key={lang.code}
            variant={currentLanguage === lang.code ? "default" : "outline"}
            size="sm"
            onClick={() => setLanguage(lang.code)}
            className="gap-1"
          >
            {showFlag && <span>{lang.flag}</span>}
            <span className="text-xs">
              {showNativeName ? lang.nativeName : lang.name}
            </span>
          </Button>
        ))}
      </div>
    );
  }

  return null;
};

// RTL-aware Text Component
interface RTLTextProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const RTLText: React.FC<RTLTextProps> = ({
  children,
  className,
  as: Component = "span",
}) => {
  const { isRTL } = useLanguage();

  return (
    <Component
      className={cn(isRTL && "text-right", !isRTL && "text-left", className)}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {children}
    </Component>
  );
};

// Translation Component
interface TranslationProps {
  k: string;
  params?: Record<string, string>;
  fallback?: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const T: React.FC<TranslationProps> = ({
  k,
  params,
  fallback,
  className,
  as: Component = "span",
}) => {
  const { t } = useLanguage();
  const translatedText = t(k, params) || fallback || k;

  return (
    <RTLText as={Component} className={className}>
      {translatedText}
    </RTLText>
  );
};

// Language Status Badge
export const LanguageStatusBadge: React.FC<{ className?: string }> = ({
  className,
}) => {
  const { currentLanguage, isRTL } = useLanguage();
  const currentLangConfig = SUPPORTED_LANGUAGES.find(
    (l) => l.code === currentLanguage,
  );

  return (
    <Badge variant="outline" className={cn("gap-1", className)}>
      <Languages className="h-3 w-3" />
      {currentLangConfig?.flag}
      <span className="text-xs">
        {currentLangConfig?.nativeName} {isRTL && "(RTL)"}
      </span>
    </Badge>
  );
};

// Export default translations for external use
export { DEFAULT_TRANSLATIONS };

export default LanguageProvider;
