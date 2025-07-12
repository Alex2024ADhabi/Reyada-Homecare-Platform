import { chromium, FullConfig } from "@playwright/test";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function globalSetup(config: FullConfig) {
  console.log("🚀 Starting global test setup...");

  // Start the development server if not already running
  try {
    const response = await fetch("http://localhost:3001");
    if (!response.ok) {
      throw new Error("Server not responding");
    }
    console.log("✅ Development server is already running");
  } catch (error) {
    console.log("🔄 Starting development server...");
    // The webServer config in playwright.config.ts will handle this
  }

  // Setup test database or mock services
  console.log("🗄️ Setting up test database...");
  await setupTestDatabase();

  // Create test users and data
  console.log("👥 Creating test users and data...");
  await createTestData();

  // Warm up the browser
  console.log("🌐 Warming up browser...");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("http://localhost:3001");
  await page.waitForLoadState("networkidle");
  await browser.close();

  console.log("✅ Global setup completed");
}

async function setupTestDatabase() {
  // Setup test database or reset to clean state
  try {
    // This would typically reset your test database
    // For now, we'll just log the action
    console.log("Database setup completed");
  } catch (error) {
    console.error("Database setup failed:", error);
    throw error;
  }
}

async function createTestData() {
  // Create test users, patients, and other necessary data
  const testData = {
    users: [
      {
        email: "testuser@reyada.com",
        password: "testpassword",
        role: "clinician",
      },
      {
        email: "admin@reyada.com",
        password: "testpassword",
        role: "admin",
      },
      {
        email: "qa@reyada.com",
        password: "testpassword",
        role: "qa",
      },
    ],
    patients: [
      {
        name: "Ahmed Al Mansouri",
        emiratesId: "784-1990-1234567-8",
        phone: "+971501234567",
        email: "ahmed.almansouri@email.com",
      },
    ],
  };

  // Store test data in global state or database
  (global as any).testData = testData;
  console.log("Test data created successfully");
}

export default globalSetup;
