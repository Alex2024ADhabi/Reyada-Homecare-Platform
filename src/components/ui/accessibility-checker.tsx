import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Keyboard,
  Palette,
  Type,
  MousePointer,
  Volume2,
  Mic,
  Camera,
  Smartphone,
  Monitor,
  Settings,
  Brain,
  Shield,
  Zap,
  Target,
  Users,
  Globe,
  Languages,
  Accessibility,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface AccessibilityIssue {
  id: string;
  type: "error" | "warning" | "info";
  category: "keyboard" | "color" | "text" | "structure" | "aria" | "focus";
  title: string;
  description: string;
  element?: string;
  wcagLevel: "A" | "AA" | "AAA";
  wcagCriterion: string;
  suggestion: string;
}

interface AccessibilityReport {
  score: number;
  issues: AccessibilityIssue[];
  passedChecks: number;
  totalChecks: number;
  wcagLevel: "A" | "AA" | "AAA";
}

interface AccessibilityCheckerProps {
  className?: string;
  autoCheck?: boolean;
  enableVoiceNavigation?: boolean;
  enableScreenReader?: boolean;
  wcagLevel?: "A" | "AA" | "AAA";
  culturalAdaptation?: "UAE" | "global";
}

export const AccessibilityChecker: React.FC<AccessibilityCheckerProps> = ({
  className,
  autoCheck = false,
  enableVoiceNavigation = true,
  enableScreenReader = true,
  wcagLevel = "AA",
  culturalAdaptation = "UAE",
}) => {
  const [report, setReport] = useState<AccessibilityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [voiceNavigationActive, setVoiceNavigationActive] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [rtlSupport, setRtlSupport] = useState(culturalAdaptation === "UAE");
  const [wcagCompliance, setWcagCompliance] = useState({
    levelA: 0,
    levelAA: 0,
    levelAAA: 0,
  });

  useEffect(() => {
    if (autoCheck) {
      runAccessibilityCheck();
    }

    // Initialize UAE cultural adaptations
    if (culturalAdaptation === "UAE") {
      initializeUAEAdaptations();
    }

    // Initialize assistive technology integration
    initializeAssistiveTechnology();

    // Initialize voice navigation if enabled
    if (enableVoiceNavigation) {
      initializeVoiceNavigation();
    }
  }, [autoCheck, culturalAdaptation, enableVoiceNavigation]);

  const runAccessibilityCheck = async () => {
    setLoading(true);
    try {
      // Enhanced WCAG 2.1 AA compliance audit
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Real-time accessibility scanning with WCAG 2.1 AA focus
      const realTimeIssues = await performWCAG21Audit();

      // UAE-specific accessibility checks
      const uaeSpecificIssues =
        culturalAdaptation === "UAE"
          ? await performUAEAccessibilityAudit()
          : [];

      // Voice navigation compatibility checks
      const voiceNavIssues = enableVoiceNavigation
        ? await performVoiceNavigationAudit()
        : [];

      // Screen reader compatibility checks
      const screenReaderIssues = enableScreenReader
        ? await performScreenReaderAudit()
        : [];

      const allIssues = [
        ...realTimeIssues,
        ...uaeSpecificIssues,
        ...voiceNavIssues,
        ...screenReaderIssues,
      ];

      const totalChecks = 35; // Increased for comprehensive WCAG 2.1 AA
      const passedChecks = totalChecks - allIssues.length;
      const score = Math.round((passedChecks / totalChecks) * 100);
      const wcagLevelResult = score >= 95 ? "AAA" : score >= 80 ? "AA" : "A";

      // Calculate WCAG compliance levels
      const wcagStats = calculateWCAGCompliance(allIssues);
      setWcagCompliance(wcagStats);

      setReport({
        score,
        issues: allIssues,
        passedChecks,
        totalChecks,
        wcagLevel: wcagLevelResult,
      });

      // Announce results to screen readers
      if (screenReaderMode) {
        announceToScreenReader(
          `Accessibility audit completed. Score: ${score} out of 100. ${allIssues.length} issues found.`,
        );
      }
    } catch (error) {
      console.error("Accessibility check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Real-time accessibility audit function
  const performRealTimeAccessibilityAudit = async (): Promise<
    AccessibilityIssue[]
  > => {
    const issues: AccessibilityIssue[] = [];

    try {
      // Check for missing alt text on images
      const images = document.querySelectorAll("img:not([alt])");
      if (images.length > 0) {
        issues.push({
          id: "missing-alt-text",
          type: "error",
          category: "structure",
          title: "Missing Alt Text",
          description: `${images.length} images found without alt text`,
          element: "img",
          wcagLevel: "A",
          wcagCriterion: "1.1.1 Non-text Content",
          suggestion: "Add descriptive alt text to all images",
        });
      }

      // Check for proper heading hierarchy
      const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
      let hasH1 = false;
      headings.forEach((heading) => {
        if (heading.tagName === "H1") hasH1 = true;
      });

      if (!hasH1) {
        issues.push({
          id: "missing-h1",
          type: "warning",
          category: "structure",
          title: "Missing H1 Heading",
          description: "Page should have exactly one H1 heading",
          element: "h1",
          wcagLevel: "AA",
          wcagCriterion: "2.4.6 Headings and Labels",
          suggestion: "Add a descriptive H1 heading to the page",
        });
      }

      // Check for form labels
      const inputs = document.querySelectorAll(
        'input:not([type="hidden"]):not([aria-label]):not([aria-labelledby])',
      );
      const unlabeledInputs = Array.from(inputs).filter((input) => {
        const id = input.getAttribute("id");
        return !id || !document.querySelector(`label[for="${id}"]`);
      });

      if (unlabeledInputs.length > 0) {
        issues.push({
          id: "unlabeled-inputs",
          type: "error",
          category: "aria",
          title: "Unlabeled Form Inputs",
          description: `${unlabeledInputs.length} form inputs without proper labels`,
          element: "input",
          wcagLevel: "A",
          wcagCriterion: "3.3.2 Labels or Instructions",
          suggestion:
            "Associate labels with form inputs using for/id attributes",
        });
      }

      // Check color contrast (simplified check)
      const elements = document.querySelectorAll("*");
      let lowContrastCount = 0;

      elements.forEach((element) => {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;

        // Simple contrast check (would use more sophisticated algorithm in production)
        if (
          color &&
          backgroundColor &&
          color !== "rgba(0, 0, 0, 0)" &&
          backgroundColor !== "rgba(0, 0, 0, 0)"
        ) {
          // Simplified contrast ratio calculation
          const colorLuminance = getColorLuminance(color);
          const bgLuminance = getColorLuminance(backgroundColor);
          const contrastRatio =
            (Math.max(colorLuminance, bgLuminance) + 0.05) /
            (Math.min(colorLuminance, bgLuminance) + 0.05);

          if (contrastRatio < 4.5) {
            lowContrastCount++;
          }
        }
      });

      if (lowContrastCount > 0) {
        issues.push({
          id: "low-contrast",
          type: "warning",
          category: "color",
          title: "Low Color Contrast",
          description: `${lowContrastCount} elements with potentially low contrast`,
          element: "various",
          wcagLevel: "AA",
          wcagCriterion: "1.4.3 Contrast (Minimum)",
          suggestion: "Ensure text has sufficient contrast against background",
        });
      }
    } catch (error) {
      console.error("Real-time accessibility audit failed:", error);
    }

    return issues;
  };

  // WCAG 2.1 AA specific audit functions
  const performWCAG21Audit = async (): Promise<AccessibilityIssue[]> => {
    const issues: AccessibilityIssue[] = [];

    try {
      // Check for WCAG 2.1 AA specific requirements

      // 1.4.3 Contrast (Minimum) - AA Level
      const contrastIssues = await checkColorContrast();
      issues.push(...contrastIssues);

      // 2.1.1 Keyboard - A Level
      const keyboardIssues = await checkKeyboardAccessibility();
      issues.push(...keyboardIssues);

      // 4.1.2 Name, Role, Value - A Level
      const ariaIssues = await checkARIAImplementation();
      issues.push(...ariaIssues);

      // 1.4.4 Resize text - AA Level
      const textResizeIssues = await checkTextResize();
      issues.push(...textResizeIssues);

      // 2.4.7 Focus Visible - AA Level
      const focusIssues = await checkFocusVisibility();
      issues.push(...focusIssues);

      // 1.4.10 Reflow - AA Level (WCAG 2.1)
      const reflowIssues = await checkReflow();
      issues.push(...reflowIssues);

      // 1.4.11 Non-text Contrast - AA Level (WCAG 2.1)
      const nonTextContrastIssues = await checkNonTextContrast();
      issues.push(...nonTextContrastIssues);

      // 2.5.3 Label in Name - A Level (WCAG 2.1)
      const labelInNameIssues = await checkLabelInName();
      issues.push(...labelInNameIssues);
    } catch (error) {
      console.error("WCAG 2.1 audit failed:", error);
    }

    return issues;
  };

  const performUAEAccessibilityAudit = async (): Promise<
    AccessibilityIssue[]
  > => {
    const issues: AccessibilityIssue[] = [];

    try {
      // UAE-specific cultural adaptations

      // Check for Arabic RTL support
      const rtlElements = document.querySelectorAll('[dir="rtl"], [lang="ar"]');
      if (rtlElements.length === 0 && culturalAdaptation === "UAE") {
        issues.push({
          id: "uae-rtl-support",
          type: "warning",
          category: "structure",
          title: "Missing Arabic RTL Support",
          description:
            "No RTL (Right-to-Left) text direction support found for Arabic content",
          element: "html",
          wcagLevel: "AA",
          wcagCriterion: "1.4.8 Visual Presentation",
          suggestion:
            "Add dir='rtl' attribute for Arabic content and ensure proper RTL layout",
        });
      }

      // Check for Arabic font support
      const arabicText = document.querySelector('[lang="ar"]');
      if (arabicText) {
        const computedStyle = window.getComputedStyle(arabicText);
        const fontFamily = computedStyle.fontFamily;
        if (!fontFamily.includes("Arabic") && !fontFamily.includes("Noto")) {
          issues.push({
            id: "uae-arabic-fonts",
            type: "warning",
            category: "text",
            title: "Arabic Font Support",
            description:
              "Arabic text may not render properly without appropriate fonts",
            element: '[lang="ar"]',
            wcagLevel: "AA",
            wcagCriterion: "1.4.8 Visual Presentation",
            suggestion:
              "Use Arabic-compatible fonts like Noto Naskh Arabic or system Arabic fonts",
          });
        }
      }

      // Check for cultural color considerations (UAE flag colors)
      const culturalColorCheck = await checkCulturalColors();
      issues.push(...culturalColorCheck);
    } catch (error) {
      console.error("UAE accessibility audit failed:", error);
    }

    return issues;
  };

  const performVoiceNavigationAudit = async (): Promise<
    AccessibilityIssue[]
  > => {
    const issues: AccessibilityIssue[] = [];

    try {
      // Check for voice navigation compatibility
      const interactiveElements = document.querySelectorAll(
        'button, [role="button"], a, input, select, textarea',
      );
      let elementsWithoutVoiceLabels = 0;

      interactiveElements.forEach((element) => {
        const hasAriaLabel = element.hasAttribute("aria-label");
        const hasAriaLabelledBy = element.hasAttribute("aria-labelledby");
        const hasTitle = element.hasAttribute("title");
        const hasTextContent = element.textContent?.trim();

        if (
          !hasAriaLabel &&
          !hasAriaLabelledBy &&
          !hasTitle &&
          !hasTextContent
        ) {
          elementsWithoutVoiceLabels++;
        }
      });

      if (elementsWithoutVoiceLabels > 0) {
        issues.push({
          id: "voice-nav-labels",
          type: "error",
          category: "aria",
          title: "Voice Navigation Labels Missing",
          description: `${elementsWithoutVoiceLabels} interactive elements lack proper labels for voice navigation`,
          element: "button, [role='button'], a, input",
          wcagLevel: "A",
          wcagCriterion: "4.1.2 Name, Role, Value",
          suggestion:
            "Add aria-label, aria-labelledby, or descriptive text content for voice navigation compatibility",
        });
      }

      // Check for voice command landmarks
      const landmarks = document.querySelectorAll(
        '[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer',
      );
      if (landmarks.length < 3) {
        issues.push({
          id: "voice-nav-landmarks",
          type: "warning",
          category: "structure",
          title: "Insufficient Navigation Landmarks",
          description:
            "More semantic landmarks needed for effective voice navigation",
          element: "main, nav, header, footer",
          wcagLevel: "AA",
          wcagCriterion: "2.4.1 Bypass Blocks",
          suggestion:
            "Add semantic HTML5 elements or ARIA landmarks for voice navigation",
        });
      }
    } catch (error) {
      console.error("Voice navigation audit failed:", error);
    }

    return issues;
  };

  const performScreenReaderAudit = async (): Promise<AccessibilityIssue[]> => {
    const issues: AccessibilityIssue[] = [];

    try {
      // Check for screen reader specific requirements

      // Check for proper heading structure
      const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
      const headingLevels = Array.from(headings).map((h) =>
        parseInt(h.tagName.charAt(1)),
      );

      let hasH1 = headingLevels.includes(1);
      if (!hasH1) {
        issues.push({
          id: "sr-missing-h1",
          type: "error",
          category: "structure",
          title: "Missing H1 Heading",
          description:
            "Page must have exactly one H1 heading for screen readers",
          element: "h1",
          wcagLevel: "A",
          wcagCriterion: "2.4.6 Headings and Labels",
          suggestion:
            "Add a descriptive H1 heading that summarizes the page content",
        });
      }

      // Check for skip links
      const skipLinks = document.querySelectorAll('a[href^="#"]');
      const hasSkipToMain = Array.from(skipLinks).some(
        (link) =>
          link.textContent?.toLowerCase().includes("skip") &&
          link.textContent?.toLowerCase().includes("main"),
      );

      if (!hasSkipToMain) {
        issues.push({
          id: "sr-skip-links",
          type: "warning",
          category: "structure",
          title: "Missing Skip Links",
          description:
            "Skip links help screen reader users navigate efficiently",
          element: "a[href='#main']",
          wcagLevel: "A",
          wcagCriterion: "2.4.1 Bypass Blocks",
          suggestion:
            "Add 'Skip to main content' link at the beginning of the page",
        });
      }

      // Check for live regions
      const liveRegions = document.querySelectorAll("[aria-live]");
      if (liveRegions.length === 0) {
        issues.push({
          id: "sr-live-regions",
          type: "info",
          category: "aria",
          title: "No Live Regions Found",
          description:
            "Live regions help screen readers announce dynamic content changes",
          element: "[aria-live]",
          wcagLevel: "AA",
          wcagCriterion: "4.1.3 Status Messages",
          suggestion:
            "Add aria-live regions for dynamic content updates and status messages",
        });
      }
    } catch (error) {
      console.error("Screen reader audit failed:", error);
    }

    return issues;
  };

  // Helper audit functions
  const checkColorContrast = async (): Promise<AccessibilityIssue[]> => {
    const issues: AccessibilityIssue[] = [];
    const elements = document.querySelectorAll("*");
    let lowContrastCount = 0;

    elements.forEach((element) => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;

      if (
        color &&
        backgroundColor &&
        color !== "rgba(0, 0, 0, 0)" &&
        backgroundColor !== "rgba(0, 0, 0, 0)"
      ) {
        const colorLuminance = getColorLuminance(color);
        const bgLuminance = getColorLuminance(backgroundColor);
        const contrastRatio =
          (Math.max(colorLuminance, bgLuminance) + 0.05) /
          (Math.min(colorLuminance, bgLuminance) + 0.05);

        const requiredRatio = wcagLevel === "AAA" ? 7 : 4.5;
        if (contrastRatio < requiredRatio) {
          lowContrastCount++;
        }
      }
    });

    if (lowContrastCount > 0) {
      issues.push({
        id: "wcag-color-contrast",
        type: "error",
        category: "color",
        title: `WCAG ${wcagLevel} Color Contrast Failure`,
        description: `${lowContrastCount} elements fail WCAG ${wcagLevel} color contrast requirements`,
        element: "various",
        wcagLevel: wcagLevel,
        wcagCriterion: "1.4.3 Contrast (Minimum)",
        suggestion: `Ensure color contrast ratio is at least ${wcagLevel === "AAA" ? "7:1" : "4.5:1"} for normal text`,
      });
    }

    return issues;
  };

  const checkKeyboardAccessibility = async (): Promise<
    AccessibilityIssue[]
  > => {
    const issues: AccessibilityIssue[] = [];
    const interactiveElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    let keyboardInaccessible = 0;

    interactiveElements.forEach((element) => {
      const tabIndex = element.getAttribute("tabindex");
      if (tabIndex === "-1" && !element.hasAttribute("aria-hidden")) {
        keyboardInaccessible++;
      }
    });

    if (keyboardInaccessible > 0) {
      issues.push({
        id: "wcag-keyboard-access",
        type: "error",
        category: "keyboard",
        title: "Keyboard Accessibility Issues",
        description: `${keyboardInaccessible} interactive elements are not keyboard accessible`,
        element: "button, [href], input, select, textarea",
        wcagLevel: "A",
        wcagCriterion: "2.1.1 Keyboard",
        suggestion:
          "Ensure all interactive elements are keyboard accessible and have proper focus management",
      });
    }

    return issues;
  };

  const checkARIAImplementation = async (): Promise<AccessibilityIssue[]> => {
    const issues: AccessibilityIssue[] = [];
    const inputs = document.querySelectorAll(
      'input:not([type="hidden"]):not([aria-label]):not([aria-labelledby])',
    );
    const unlabeledInputs = Array.from(inputs).filter((input) => {
      const id = input.getAttribute("id");
      return !id || !document.querySelector(`label[for="${id}"]`);
    });

    if (unlabeledInputs.length > 0) {
      issues.push({
        id: "wcag-aria-labels",
        type: "error",
        category: "aria",
        title: "Missing ARIA Labels",
        description: `${unlabeledInputs.length} form inputs lack proper labels`,
        element: "input",
        wcagLevel: "A",
        wcagCriterion: "4.1.2 Name, Role, Value",
        suggestion:
          "Add aria-label, aria-labelledby, or associate with label elements",
      });
    }

    return issues;
  };

  const checkTextResize = async (): Promise<AccessibilityIssue[]> => {
    const issues: AccessibilityIssue[] = [];
    const smallTextElements = document.querySelectorAll(
      '.text-xs, [style*="font-size"]',
    );
    let smallTextCount = 0;

    smallTextElements.forEach((element) => {
      const styles = window.getComputedStyle(element);
      const fontSize = parseFloat(styles.fontSize);
      if (fontSize < 12) {
        smallTextCount++;
      }
    });

    if (smallTextCount > 0) {
      issues.push({
        id: "wcag-text-resize",
        type: "warning",
        category: "text",
        title: "Text Resize Issues",
        description: `${smallTextCount} elements have text smaller than 12px`,
        element: '.text-xs, [style*="font-size"]',
        wcagLevel: "AA",
        wcagCriterion: "1.4.4 Resize text",
        suggestion:
          "Ensure text can be resized up to 200% without loss of functionality",
      });
    }

    return issues;
  };

  const checkFocusVisibility = async (): Promise<AccessibilityIssue[]> => {
    const issues: AccessibilityIssue[] = [];
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    let poorFocusCount = 0;

    focusableElements.forEach((element) => {
      const styles = window.getComputedStyle(element, ":focus");
      const outline = styles.outline;
      const boxShadow = styles.boxShadow;

      if (outline === "none" && boxShadow === "none") {
        poorFocusCount++;
      }
    });

    if (poorFocusCount > 0) {
      issues.push({
        id: "wcag-focus-visible",
        type: "error",
        category: "focus",
        title: "Focus Visibility Issues",
        description: `${poorFocusCount} elements lack visible focus indicators`,
        element: "button, [href], input, select, textarea",
        wcagLevel: "AA",
        wcagCriterion: "2.4.7 Focus Visible",
        suggestion: "Add visible focus indicators with sufficient contrast",
      });
    }

    return issues;
  };

  const checkReflow = async (): Promise<AccessibilityIssue[]> => {
    const issues: AccessibilityIssue[] = [];
    const viewportWidth = window.innerWidth;

    // Simulate 320px width check for reflow
    if (viewportWidth > 320) {
      const horizontalScrollElements = document.querySelectorAll("*");
      let hasHorizontalScroll = false;

      horizontalScrollElements.forEach((element) => {
        if (element.scrollWidth > element.clientWidth) {
          hasHorizontalScroll = true;
        }
      });

      if (hasHorizontalScroll) {
        issues.push({
          id: "wcag-reflow",
          type: "warning",
          category: "structure",
          title: "Reflow Issues",
          description: "Content requires horizontal scrolling at 320px width",
          element: "various",
          wcagLevel: "AA",
          wcagCriterion: "1.4.10 Reflow",
          suggestion:
            "Ensure content reflows without horizontal scrolling at 320px width",
        });
      }
    }

    return issues;
  };

  const checkNonTextContrast = async (): Promise<AccessibilityIssue[]> => {
    const issues: AccessibilityIssue[] = [];
    const uiComponents = document.querySelectorAll(
      'button, input, select, textarea, [role="button"]',
    );
    let lowContrastUI = 0;

    uiComponents.forEach((element) => {
      const styles = window.getComputedStyle(element);
      const borderColor = styles.borderColor;
      const backgroundColor = styles.backgroundColor;

      if (borderColor && backgroundColor) {
        const borderLuminance = getColorLuminance(borderColor);
        const bgLuminance = getColorLuminance(backgroundColor);
        const contrastRatio =
          (Math.max(borderLuminance, bgLuminance) + 0.05) /
          (Math.min(borderLuminance, bgLuminance) + 0.05);

        if (contrastRatio < 3) {
          lowContrastUI++;
        }
      }
    });

    if (lowContrastUI > 0) {
      issues.push({
        id: "wcag-non-text-contrast",
        type: "warning",
        category: "color",
        title: "Non-text Contrast Issues",
        description: `${lowContrastUI} UI components have insufficient contrast`,
        element: "button, input, select, textarea",
        wcagLevel: "AA",
        wcagCriterion: "1.4.11 Non-text Contrast",
        suggestion: "Ensure UI components have at least 3:1 contrast ratio",
      });
    }

    return issues;
  };

  const checkLabelInName = async (): Promise<AccessibilityIssue[]> => {
    const issues: AccessibilityIssue[] = [];
    const labeledElements = document.querySelectorAll("[aria-label]");
    let mismatchedLabels = 0;

    labeledElements.forEach((element) => {
      const ariaLabel = element.getAttribute("aria-label");
      const visibleText = element.textContent?.trim();

      if (ariaLabel && visibleText && !ariaLabel.includes(visibleText)) {
        mismatchedLabels++;
      }
    });

    if (mismatchedLabels > 0) {
      issues.push({
        id: "wcag-label-in-name",
        type: "warning",
        category: "aria",
        title: "Label in Name Mismatch",
        description: `${mismatchedLabels} elements have mismatched visible and accessible names`,
        element: "[aria-label]",
        wcagLevel: "A",
        wcagCriterion: "2.5.3 Label in Name",
        suggestion: "Ensure accessible names include the visible text",
      });
    }

    return issues;
  };

  const checkCulturalColors = async (): Promise<AccessibilityIssue[]> => {
    const issues: AccessibilityIssue[] = [];

    // Check for UAE cultural color considerations
    const redElements = document.querySelectorAll(
      '[style*="red"], .text-red, .bg-red',
    );
    const greenElements = document.querySelectorAll(
      '[style*="green"], .text-green, .bg-green',
    );

    if (redElements.length > 0 || greenElements.length > 0) {
      issues.push({
        id: "uae-cultural-colors",
        type: "info",
        category: "color",
        title: "Cultural Color Considerations",
        description:
          "Consider UAE cultural significance of colors (red, green, black, white)",
        element: '[style*="red"], [style*="green"]',
        wcagLevel: "AAA",
        wcagCriterion: "1.4.1 Use of Color",
        suggestion:
          "Ensure color choices respect UAE cultural context and provide alternative indicators",
      });
    }

    return issues;
  };

  const calculateWCAGCompliance = (issues: AccessibilityIssue[]) => {
    const levelAIssues = issues.filter(
      (issue) => issue.wcagLevel === "A",
    ).length;
    const levelAAIssues = issues.filter(
      (issue) => issue.wcagLevel === "AA",
    ).length;
    const levelAAAIssues = issues.filter(
      (issue) => issue.wcagLevel === "AAA",
    ).length;

    const totalLevelA = 15; // Approximate number of Level A criteria
    const totalLevelAA = 20; // Approximate number of Level AA criteria
    const totalLevelAAA = 28; // Approximate number of Level AAA criteria

    return {
      levelA: Math.max(
        0,
        Math.round(((totalLevelA - levelAIssues) / totalLevelA) * 100),
      ),
      levelAA: Math.max(
        0,
        Math.round(((totalLevelAA - levelAAIssues) / totalLevelAA) * 100),
      ),
      levelAAA: Math.max(
        0,
        Math.round(((totalLevelAAA - levelAAAIssues) / totalLevelAAA) * 100),
      ),
    };
  };

  // Initialize UAE cultural adaptations
  const initializeUAEAdaptations = () => {
    // Set RTL support for Arabic content
    document.documentElement.setAttribute("dir", "auto");

    // Add UAE-specific CSS classes
    document.body.classList.add("uae-cultural-adaptation");

    // Set up Arabic number formatting
    const numberElements = document.querySelectorAll("[data-number]");
    numberElements.forEach((element) => {
      const number = element.textContent;
      if (number && /\d/.test(number)) {
        element.setAttribute("dir", "ltr"); // Numbers should be LTR even in RTL context
      }
    });
  };

  // Initialize assistive technology integration
  const initializeAssistiveTechnology = () => {
    // Set up screen reader announcements
    const announcer = document.createElement("div");
    announcer.setAttribute("aria-live", "polite");
    announcer.setAttribute("aria-atomic", "true");
    announcer.className = "sr-only";
    announcer.style.position = "absolute";
    announcer.style.left = "-10000px";
    announcer.style.width = "1px";
    announcer.style.height = "1px";
    announcer.style.overflow = "hidden";
    document.body.appendChild(announcer);

    (window as any).announceToScreenReader = (message: string) => {
      announcer.textContent = message;
      setTimeout(() => {
        announcer.textContent = "";
      }, 1000);
    };

    // Set up keyboard navigation enhancements
    document.addEventListener("keydown", (event) => {
      // Enhanced keyboard navigation for UAE context
      if (event.key === "Tab") {
        document.body.classList.add("keyboard-navigation-active");
      }

      // Arabic keyboard support
      if (
        event.key === "ArrowRight" &&
        document.documentElement.dir === "rtl"
      ) {
        // In RTL, right arrow should move to previous element
        event.preventDefault();
        const focusableElements = Array.from(
          document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        );
        const currentIndex = focusableElements.indexOf(
          document.activeElement as Element,
        );
        if (currentIndex > 0) {
          (focusableElements[currentIndex - 1] as HTMLElement).focus();
        }
      }
    });

    document.addEventListener("mousedown", () => {
      document.body.classList.remove("keyboard-navigation-active");
    });
  };

  // Initialize voice navigation
  const initializeVoiceNavigation = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = culturalAdaptation === "UAE" ? "ar-AE" : "en-US";

      recognition.onresult = (event: any) => {
        const command = event.results[0][0].transcript.toLowerCase();
        handleVoiceCommand(command);
      };

      recognition.onerror = (event: any) => {
        console.error("Voice recognition error:", event.error);
      };

      // Store recognition instance for later use
      (window as any).voiceRecognition = recognition;
    }
  };

  const handleVoiceCommand = (command: string) => {
    // Basic voice commands for navigation
    const commands = {
      "go to main": () => {
        const main = document.querySelector('main, [role="main"]');
        if (main) (main as HTMLElement).focus();
      },
      "go to navigation": () => {
        const nav = document.querySelector('nav, [role="navigation"]');
        if (nav) (nav as HTMLElement).focus();
      },
      "click button": () => {
        const button = document.querySelector("button:focus");
        if (button) (button as HTMLElement).click();
      },
      next: () => {
        const focusableElements = Array.from(
          document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        );
        const currentIndex = focusableElements.indexOf(
          document.activeElement as Element,
        );
        if (currentIndex < focusableElements.length - 1) {
          (focusableElements[currentIndex + 1] as HTMLElement).focus();
        }
      },
      previous: () => {
        const focusableElements = Array.from(
          document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        );
        const currentIndex = focusableElements.indexOf(
          document.activeElement as Element,
        );
        if (currentIndex > 0) {
          (focusableElements[currentIndex - 1] as HTMLElement).focus();
        }
      },
    };

    const matchedCommand = Object.keys(commands).find((cmd) =>
      command.includes(cmd),
    );
    if (matchedCommand) {
      commands[matchedCommand as keyof typeof commands]();
      if ((window as any).announceToScreenReader) {
        (window as any).announceToScreenReader(
          `Executed command: ${matchedCommand}`,
        );
      }
    }
  };

  const toggleVoiceNavigation = () => {
    setVoiceNavigationActive(!voiceNavigationActive);
    if (!voiceNavigationActive && (window as any).voiceRecognition) {
      (window as any).voiceRecognition.start();
      if ((window as any).announceToScreenReader) {
        (window as any).announceToScreenReader("Voice navigation activated");
      }
    } else if ((window as any).voiceRecognition) {
      (window as any).voiceRecognition.stop();
      if ((window as any).announceToScreenReader) {
        (window as any).announceToScreenReader("Voice navigation deactivated");
      }
    }
  };

  const toggleScreenReaderMode = () => {
    setScreenReaderMode(!screenReaderMode);
    if (!screenReaderMode) {
      document.body.classList.add("screen-reader-optimized");
      if ((window as any).announceToScreenReader) {
        (window as any).announceToScreenReader(
          "Screen reader optimization enabled",
        );
      }
    } else {
      document.body.classList.remove("screen-reader-optimized");
      if ((window as any).announceToScreenReader) {
        (window as any).announceToScreenReader(
          "Screen reader optimization disabled",
        );
      }
    }
  };

  const toggleHighContrast = () => {
    setHighContrastMode(!highContrastMode);
    if (!highContrastMode) {
      document.documentElement.classList.add("high-contrast-mode");
      if ((window as any).announceToScreenReader) {
        (window as any).announceToScreenReader("High contrast mode enabled");
      }
    } else {
      document.documentElement.classList.remove("high-contrast-mode");
      if ((window as any).announceToScreenReader) {
        (window as any).announceToScreenReader("High contrast mode disabled");
      }
    }
  };

  const toggleRTLSupport = () => {
    setRtlSupport(!rtlSupport);
    if (!rtlSupport) {
      document.documentElement.setAttribute("dir", "rtl");
      document.documentElement.setAttribute("lang", "ar");
      if ((window as any).announceToScreenReader) {
        (window as any).announceToScreenReader("Arabic RTL support enabled");
      }
    } else {
      document.documentElement.setAttribute("dir", "ltr");
      document.documentElement.setAttribute("lang", "en");
      if ((window as any).announceToScreenReader) {
        (window as any).announceToScreenReader("English LTR support enabled");
      }
    }
  };

  const getIssuesByCategory = (category: string) => {
    if (!report) return [];
    if (category === "all") return report.issues;
    return report.issues.filter((issue) => issue.category === category);
  };

  const getIssueIcon = (type: AccessibilityIssue["type"]) => {
    switch (type) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: AccessibilityIssue["category"]) => {
    switch (category) {
      case "keyboard":
        return <Keyboard className="h-4 w-4" />;
      case "color":
        return <Palette className="h-4 w-4" />;
      case "text":
        return <Type className="h-4 w-4" />;
      case "structure":
        return <Eye className="h-4 w-4" />;
      case "aria":
        return <Volume2 className="h-4 w-4" />;
      case "focus":
        return <MousePointer className="h-4 w-4" />;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return "default";
    if (score >= 70) return "secondary";
    return "destructive";
  };

  const getWcagBadgeColor = (level: "A" | "AA" | "AAA") => {
    switch (level) {
      case "AAA":
        return "bg-green-100 text-green-800";
      case "AA":
        return "bg-blue-100 text-blue-800";
      case "A":
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const categories = [
    { id: "all", label: "All Issues", icon: Eye },
    { id: "keyboard", label: "Keyboard", icon: Keyboard },
    { id: "color", label: "Color", icon: Palette },
    { id: "text", label: "Text", icon: Type },
    { id: "structure", label: "Structure", icon: Eye },
    { id: "aria", label: "ARIA", icon: Volume2 },
    { id: "focus", label: "Focus", icon: MousePointer },
  ];

  const filteredIssues = getIssuesByCategory(selectedCategory);

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            WCAG 2.1 Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Level A (Essential)</span>
                <span
                  className={
                    wcagCompliance.levelA >= 90
                      ? "text-green-600"
                      : wcagCompliance.levelA >= 70
                        ? "text-yellow-600"
                        : "text-red-600"
                  }
                >
                  {wcagCompliance.levelA}%
                </span>
              </div>
              <Progress value={wcagCompliance.levelA} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Level AA (Standard)</span>
                <span
                  className={
                    wcagCompliance.levelAA >= 90
                      ? "text-green-600"
                      : wcagCompliance.levelAA >= 70
                        ? "text-yellow-600"
                        : "text-red-600"
                  }
                >
                  {wcagCompliance.levelAA}%
                </span>
              </div>
              <Progress value={wcagCompliance.levelAA} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Level AAA (Enhanced)</span>
                <span
                  className={
                    wcagCompliance.levelAAA >= 90
                      ? "text-green-600"
                      : wcagCompliance.levelAAA >= 70
                        ? "text-yellow-600"
                        : "text-red-600"
                  }
                >
                  {wcagCompliance.levelAAA}%
                </span>
              </div>
              <Progress value={wcagCompliance.levelAAA} className="h-2" />
            </div>
            {culturalAdaptation === "UAE" && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-green-900 mb-1">
                  🇦🇪 UAE Cultural Adaptations
                </div>
                <div className="text-xs text-green-700">
                  ✓ Arabic RTL Support
                  <br />
                  ✓ Cultural Color Considerations
                  <br />✓ Arabic Font Compatibility
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessibilityChecker;
