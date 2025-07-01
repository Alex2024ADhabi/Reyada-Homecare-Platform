import { test, expect } from "@playwright/test";
import { performance } from "perf_hooks";

/**
 * Healthcare Performance Testing Suite
 * Tests performance requirements specific to healthcare applications
 * Ensures optimal user experience for clinical workflows
 */

test.describe("Healthcare Performance Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Set up performance monitoring
    await page.addInitScript(() => {
      // Mark the start of navigation
      performance.mark("navigation-start");
    });
  });

  test("Patient search performance", async ({ page }) => {
    await page.goto("/patients");

    const startTime = performance.now();

    // Perform patient search
    await page.fill('input[name="search"]', "Ahmed");
    await page.keyboard.press("Enter");

    // Wait for search results
    await page.waitForSelector('[data-testid="search-results"]', {
      timeout: 5000,
    });

    const endTime = performance.now();
    const searchTime = endTime - startTime;

    // Patient search should complete within 2 seconds
    expect(searchTime).toBeLessThan(2000);

    // Check that results are displayed
    const results = page.locator('[data-testid="patient-result"]');
    await expect(results.first()).toBeVisible();
  });

  test("Clinical form loading performance", async ({ page }) => {
    await page.goto("/clinical/assessment/new");

    const startTime = performance.now();

    // Wait for form to be fully loaded
    await page.waitForSelector('form[data-testid="assessment-form"]', {
      timeout: 10000,
    });
    await page.waitForLoadState("networkidle");

    const endTime = performance.now();
    const loadTime = endTime - startTime;

    // Clinical forms should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Verify all form sections are loaded
    const formSections = page.locator(".form-section");
    const sectionCount = await formSections.count();
    expect(sectionCount).toBeGreaterThan(0);
  });

  test("Dashboard loading performance", async ({ page }) => {
    await page.goto("/dashboard");

    const startTime = performance.now();

    // Wait for dashboard widgets to load
    await page.waitForSelector('[data-testid="dashboard-widget"]', {
      timeout: 8000,
    });
    await page.waitForLoadState("networkidle");

    const endTime = performance.now();
    const loadTime = endTime - startTime;

    // Dashboard should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);

    // Check that key metrics are displayed
    const widgets = page.locator('[data-testid="dashboard-widget"]');
    const widgetCount = await widgets.count();
    expect(widgetCount).toBeGreaterThan(0);
  });

  test("Claims submission performance", async ({ page }) => {
    await page.goto("/revenue/claims/new");

    // Fill out claim form
    await page.fill('input[name="patientId"]', "patient-123");
    await page.selectOption('select[name="claimType"]', "homecare");
    await page.fill('input[name="serviceCode"]', "NURSE-001");
    await page.fill('input[name="amount"]', "150.00");

    const startTime = performance.now();

    // Submit claim
    await page.click('button[type="submit"]');

    // Wait for submission confirmation
    await page.waitForSelector('[data-testid="submission-success"]', {
      timeout: 10000,
    });

    const endTime = performance.now();
    const submissionTime = endTime - startTime;

    // Claim submission should complete within 8 seconds
    expect(submissionTime).toBeLessThan(8000);
  });

  test("DOH report generation performance", async ({ page }) => {
    await page.goto("/compliance/doh-reporting");

    const startTime = performance.now();

    // Generate DOH report
    await page.selectOption('select[name="reportType"]', "monthly");
    await page.selectOption('select[name="month"]', "2024-01");
    await page.click('button[data-testid="generate-report"]');

    // Wait for report generation
    await page.waitForSelector('[data-testid="report-ready"]', {
      timeout: 30000,
    });

    const endTime = performance.now();
    const generationTime = endTime - startTime;

    // DOH report generation should complete within 25 seconds
    expect(generationTime).toBeLessThan(25000);
  });

  test("Large dataset handling performance", async ({ page }) => {
    await page.goto("/patients?limit=100");

    const startTime = performance.now();

    // Wait for large patient list to load
    await page.waitForSelector('[data-testid="patient-list"]', {
      timeout: 15000,
    });
    await page.waitForLoadState("networkidle");

    const endTime = performance.now();
    const loadTime = endTime - startTime;

    // Large dataset should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);

    // Verify pagination or virtual scrolling is working
    const patientRows = page.locator('[data-testid="patient-row"]');
    const rowCount = await patientRows.count();
    expect(rowCount).toBeGreaterThan(0);
    expect(rowCount).toBeLessThanOrEqual(100);
  });

  test("Mobile performance", async ({ page, browserName }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const startTime = performance.now();

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const endTime = performance.now();
    const loadTime = endTime - startTime;

    // Mobile loading should be within 4 seconds
    expect(loadTime).toBeLessThan(4000);

    // Test mobile navigation performance
    const navStartTime = performance.now();

    await page.click('[data-testid="mobile-menu-toggle"]');
    await page.waitForSelector('[data-testid="mobile-menu"]', {
      timeout: 2000,
    });

    const navEndTime = performance.now();
    const navTime = navEndTime - navStartTime;

    // Mobile navigation should be instant
    expect(navTime).toBeLessThan(500);
  });

  test("Memory usage monitoring", async ({ page }) => {
    await page.goto("/");

    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Navigate through several pages to test for memory leaks
    const pages = [
      "/patients",
      "/clinical/documentation",
      "/revenue/claims",
      "/dashboard",
    ];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000); // Allow for cleanup
    }

    // Get final memory usage
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Memory usage should not increase dramatically (allow for 50MB increase)
    const memoryIncrease = finalMemory - initialMemory;
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
  });

  test("API response time monitoring", async ({ page }) => {
    const apiTimes: number[] = [];

    // Monitor API response times
    page.on("response", (response) => {
      if (response.url().includes("/api/")) {
        const timing = response.request().timing();
        if (timing) {
          apiTimes.push(timing.responseEnd - timing.requestStart);
        }
      }
    });

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Check API response times
    if (apiTimes.length > 0) {
      const averageApiTime =
        apiTimes.reduce((a, b) => a + b, 0) / apiTimes.length;
      const maxApiTime = Math.max(...apiTimes);

      // Average API response should be under 1 second
      expect(averageApiTime).toBeLessThan(1000);

      // No single API call should take more than 5 seconds
      expect(maxApiTime).toBeLessThan(5000);
    }
  });

  test("Concurrent user simulation", async ({ page, context }) => {
    // Create multiple pages to simulate concurrent users
    const pages = await Promise.all([
      context.newPage(),
      context.newPage(),
      context.newPage(),
    ]);

    const startTime = performance.now();

    // Simulate concurrent operations
    await Promise.all([
      pages[0].goto("/patients"),
      pages[1].goto("/clinical/documentation"),
      pages[2].goto("/revenue/claims"),
    ]);

    await Promise.all([
      pages[0].waitForLoadState("networkidle"),
      pages[1].waitForLoadState("networkidle"),
      pages[2].waitForLoadState("networkidle"),
    ]);

    const endTime = performance.now();
    const concurrentTime = endTime - startTime;

    // Concurrent operations should complete within 8 seconds
    expect(concurrentTime).toBeLessThan(8000);

    // Clean up
    await Promise.all(pages.map((p) => p.close()));
  });

  test("Form auto-save performance", async ({ page }) => {
    await page.goto("/clinical/assessment/new");

    // Fill form fields and measure auto-save performance
    const fields = [
      { name: "patientId", value: "patient-123" },
      { name: "assessmentType", value: "initial" },
      {
        name: "clinicalNotes",
        value: "Test clinical notes for performance testing",
      },
    ];

    for (const field of fields) {
      const startTime = performance.now();

      await page.fill(
        `input[name="${field.name}"], textarea[name="${field.name}"]`,
        field.value,
      );

      // Wait for auto-save indicator
      await page.waitForSelector('[data-testid="auto-save-success"]', {
        timeout: 3000,
      });

      const endTime = performance.now();
      const autoSaveTime = endTime - startTime;

      // Auto-save should complete within 2 seconds
      expect(autoSaveTime).toBeLessThan(2000);
    }
  });

  test("Offline mode performance", async ({ page }) => {
    await page.goto("/");

    // Simulate offline mode
    await page.context().setOffline(true);

    const startTime = performance.now();

    // Try to navigate while offline
    await page.goto("/patients");

    // Should show offline indicator quickly
    await page.waitForSelector('[data-testid="offline-indicator"]', {
      timeout: 2000,
    });

    const endTime = performance.now();
    const offlineDetectionTime = endTime - startTime;

    // Offline detection should be immediate
    expect(offlineDetectionTime).toBeLessThan(1000);

    // Restore online mode
    await page.context().setOffline(false);
  });
});

test.describe("Healthcare Performance Benchmarks", () => {
  test("Core Web Vitals measurement", async ({ page }) => {
    await page.goto("/");

    // Measure Core Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {
          LCP: 0, // Largest Contentful Paint
          FID: 0, // First Input Delay
          CLS: 0, // Cumulative Layout Shift
        };

        // Measure LCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.LCP = lastEntry.startTime;
        }).observe({ entryTypes: ["largest-contentful-paint"] });

        // Measure FID
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            vitals.FID = entry.processingStart - entry.startTime;
          });
        }).observe({ entryTypes: ["first-input"] });

        // Measure CLS
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (!(entry as any).hadRecentInput) {
              vitals.CLS += (entry as any).value;
            }
          });
        }).observe({ entryTypes: ["layout-shift"] });

        setTimeout(() => resolve(vitals), 5000);
      });
    });

    // Healthcare applications should meet strict Core Web Vitals thresholds
    expect((webVitals as any).LCP).toBeLessThan(2500); // LCP < 2.5s
    expect((webVitals as any).FID).toBeLessThan(100); // FID < 100ms
    expect((webVitals as any).CLS).toBeLessThan(0.1); // CLS < 0.1
  });

  test("Bundle size analysis", async ({ page }) => {
    const resourceSizes: { [key: string]: number } = {};

    page.on("response", (response) => {
      const url = response.url();
      const contentLength = response.headers()["content-length"];

      if (contentLength && (url.endsWith(".js") || url.endsWith(".css"))) {
        resourceSizes[url] = parseInt(contentLength);
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Calculate total bundle size
    const totalSize = Object.values(resourceSizes).reduce((a, b) => a + b, 0);

    // Total bundle size should be reasonable for healthcare applications
    expect(totalSize).toBeLessThan(2 * 1024 * 1024); // 2MB limit

    console.log(`Total bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
  });
});
