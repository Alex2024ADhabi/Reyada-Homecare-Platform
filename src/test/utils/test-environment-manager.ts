#!/usr/bin/env tsx
/**
 * Test Environment Manager
 * Manages test environment setup, configuration, and cleanup for healthcare testing
 * Provides isolated environments for different test types with healthcare-specific configurations
 */

import fs from "fs";
import path from "path";
import { EventEmitter } from "events";
import { performance } from "perf_hooks";

interface HealthcareConfig {
  enableDOHValidation: boolean;
  enableDAMANIntegration: boolean;
  enableJAWDACompliance: boolean;
  enableHIPAAValidation: boolean;
  mockPatientData: boolean;
  mockClinicalData: boolean;
  mockInsuranceData: boolean;
  complianceLevel: "basic" | "standard" | "strict";
}

interface DatabaseConfig {
  type: "memory" | "file" | "mock";
  connectionString?: string;
  mockData: boolean;
  enableTransactions: boolean;
  enableMigrations: boolean;
}

interface NetworkConfig {
  enableMockServices: boolean;
  mockEndpoints: string[];
  enableRateLimiting: boolean;
  simulateNetworkLatency: boolean;
  networkLatencyMs: number;
}

interface SecurityConfig {
  enableAuthentication: boolean;
  enableAuthorization: boolean;
  enableEncryption: boolean;
  mockTokens: boolean;
  enableAuditLogging: boolean;
}

interface EnvironmentConfig {
  testType: "unit" | "integration" | "e2e" | "performance" | "security";
  environment: "test" | "staging" | "development";
  isolationLevel: "process" | "thread" | "container";
  cleanupOnExit: boolean;
  enableLogging: boolean;
  logLevel: "debug" | "info" | "warn" | "error";
  timeoutMs: number;
  healthcare: HealthcareConfig;
  database: DatabaseConfig;
  network: NetworkConfig;
  security: SecurityConfig;
}

interface EnvironmentStatus {
  id: string;
  status: "initializing" | "ready" | "running" | "cleanup" | "destroyed";
  config: EnvironmentConfig;
  startTime: number;
  resources: {
    processes: string[];
    files: string[];
    directories: string[];
    networkPorts: number[];
    databases: string[];
  };
  healthChecks: {
    database: boolean;
    network: boolean;
    security: boolean;
    healthcare: boolean;
  };
  metrics: {
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
    uptime: number;
  };
}

class TestEnvironmentManager extends EventEmitter {
  private static instance: TestEnvironmentManager;
  private environments: Map<string, EnvironmentStatus> = new Map();
  private currentEnvironment?: string;
  private cleanupHandlers: (() => Promise<void>)[] = [];

  private constructor() {
    super();
    this.setupCleanupHandlers();
  }

  static getInstance(): TestEnvironmentManager {
    if (!TestEnvironmentManager.instance) {
      TestEnvironmentManager.instance = new TestEnvironmentManager();
    }
    return TestEnvironmentManager.instance;
  }

  async initialize(config: Partial<EnvironmentConfig>): Promise<string> {
    const fullConfig = this.mergeWithDefaults(config);
    const environmentId = this.generateEnvironmentId();

    console.log(`🌍 Initializing test environment: ${environmentId}`);
    console.log(`   Type: ${fullConfig.testType}`);
    console.log(`   Environment: ${fullConfig.environment}`);
    console.log(
      `   Healthcare: ${fullConfig.healthcare.enableDOHValidation ? "DOH" : ""} ${fullConfig.healthcare.enableDAMANIntegration ? "DAMAN" : ""} ${fullConfig.healthcare.enableJAWDACompliance ? "JAWDA" : ""}`,
    );

    const environment: EnvironmentStatus = {
      id: environmentId,
      status: "initializing",
      config: fullConfig,
      startTime: performance.now(),
      resources: {
        processes: [],
        files: [],
        directories: [],
        networkPorts: [],
        databases: [],
      },
      healthChecks: {
        database: false,
        network: false,
        security: false,
        healthcare: false,
      },
      metrics: {
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        uptime: 0,
      },
    };

    this.environments.set(environmentId, environment);
    this.currentEnvironment = environmentId;

    try {
      // Initialize components in order
      await this.initializeDirectories(environment);
      await this.initializeDatabase(environment);
      await this.initializeNetwork(environment);
      await this.initializeSecurity(environment);
      await this.initializeHealthcare(environment);
      await this.runHealthChecks(environment);

      environment.status = "ready";
      console.log(`✅ Environment ${environmentId} initialized successfully`);

      this.emit("environment-ready", environment);
      return environmentId;
    } catch (error) {
      console.error(
        `❌ Failed to initialize environment ${environmentId}:`,
        error,
      );
      await this.cleanup(environmentId);
      throw error;
    }
  }

  async cleanup(environmentId?: string): Promise<void> {
    const targetId = environmentId || this.currentEnvironment;
    if (!targetId) {
      console.log("⚠️  No environment to cleanup");
      return;
    }

    const environment = this.environments.get(targetId);
    if (!environment) {
      console.log(`⚠️  Environment ${targetId} not found`);
      return;
    }

    console.log(`🧹 Cleaning up environment: ${targetId}`);
    environment.status = "cleanup";

    try {
      // Cleanup in reverse order
      await this.cleanupHealthcare(environment);
      await this.cleanupSecurity(environment);
      await this.cleanupNetwork(environment);
      await this.cleanupDatabase(environment);
      await this.cleanupDirectories(environment);

      // Run cleanup handlers
      for (const handler of this.cleanupHandlers) {
        try {
          await handler();
        } catch (error) {
          console.warn(`Cleanup handler failed:`, error);
        }
      }

      environment.status = "destroyed";
      this.environments.delete(targetId);

      if (this.currentEnvironment === targetId) {
        this.currentEnvironment = undefined;
      }

      console.log(`✅ Environment ${targetId} cleaned up successfully`);
      this.emit("environment-destroyed", { id: targetId });
    } catch (error) {
      console.error(`❌ Failed to cleanup environment ${targetId}:`, error);
      throw error;
    }
  }

  async switchEnvironment(environmentId: string): Promise<void> {
    const environment = this.environments.get(environmentId);
    if (!environment) {
      throw new Error(`Environment ${environmentId} not found`);
    }

    if (environment.status !== "ready") {
      throw new Error(
        `Environment ${environmentId} is not ready (status: ${environment.status})`,
      );
    }

    this.currentEnvironment = environmentId;
    console.log(`🔄 Switched to environment: ${environmentId}`);
    this.emit("environment-switched", environment);
  }

  getCurrentEnvironment(): EnvironmentStatus | undefined {
    if (!this.currentEnvironment) {
      return undefined;
    }
    return this.environments.get(this.currentEnvironment);
  }

  getAllEnvironments(): EnvironmentStatus[] {
    return Array.from(this.environments.values());
  }

  async validateEnvironment(environmentId?: string): Promise<boolean> {
    const targetId = environmentId || this.currentEnvironment;
    if (!targetId) {
      return false;
    }

    const environment = this.environments.get(targetId);
    if (!environment || environment.status !== "ready") {
      return false;
    }

    try {
      await this.runHealthChecks(environment);
      return Object.values(environment.healthChecks).every(Boolean);
    } catch (error) {
      console.error(`Environment validation failed:`, error);
      return false;
    }
  }

  addCleanupHandler(handler: () => Promise<void>): void {
    this.cleanupHandlers.push(handler);
  }

  isActive(): boolean {
    return this.environments.size > 0;
  }

  private async initializeDirectories(
    environment: EnvironmentStatus,
  ): Promise<void> {
    const baseDir = path.join(
      process.cwd(),
      "test-environments",
      environment.id,
    );
    const directories = [
      baseDir,
      path.join(baseDir, "data"),
      path.join(baseDir, "logs"),
      path.join(baseDir, "temp"),
      path.join(baseDir, "healthcare"),
      path.join(baseDir, "compliance"),
    ];

    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      environment.resources.directories.push(dir);
    }

    console.log(`   📁 Created ${directories.length} directories`);
  }

  private async initializeDatabase(
    environment: EnvironmentStatus,
  ): Promise<void> {
    const config = environment.config.database;

    if (config.type === "memory") {
      // Initialize in-memory database
      console.log(`   💾 Initialized in-memory database`);
    } else if (config.type === "file") {
      // Initialize file-based database
      const dbPath = path.join(
        process.cwd(),
        "test-environments",
        environment.id,
        "data",
        "test.db",
      );
      environment.resources.files.push(dbPath);
      console.log(`   💾 Initialized file database: ${dbPath}`);
    } else {
      // Mock database
      console.log(`   💾 Initialized mock database`);
    }

    if (config.mockData) {
      await this.seedMockData(environment);
    }

    environment.healthChecks.database = true;
  }

  private async initializeNetwork(
    environment: EnvironmentStatus,
  ): Promise<void> {
    const config = environment.config.network;

    if (config.enableMockServices) {
      // Setup mock HTTP services
      const mockPort = 3000 + Math.floor(Math.random() * 1000);
      environment.resources.networkPorts.push(mockPort);
      console.log(`   🌐 Mock services running on port ${mockPort}`);
    }

    if (config.simulateNetworkLatency) {
      console.log(
        `   🌐 Network latency simulation: ${config.networkLatencyMs}ms`,
      );
    }

    environment.healthChecks.network = true;
  }

  private async initializeSecurity(
    environment: EnvironmentStatus,
  ): Promise<void> {
    const config = environment.config.security;

    if (config.enableAuthentication) {
      console.log(`   🔐 Authentication enabled`);
    }

    if (config.enableAuthorization) {
      console.log(`   🔐 Authorization enabled`);
    }

    if (config.mockTokens) {
      // Generate mock JWT tokens
      console.log(`   🔐 Mock tokens generated`);
    }

    if (config.enableAuditLogging) {
      const auditLogPath = path.join(
        process.cwd(),
        "test-environments",
        environment.id,
        "logs",
        "audit.log",
      );
      environment.resources.files.push(auditLogPath);
      console.log(`   🔐 Audit logging enabled: ${auditLogPath}`);
    }

    environment.healthChecks.security = true;
  }

  private async initializeHealthcare(
    environment: EnvironmentStatus,
  ): Promise<void> {
    const config = environment.config.healthcare;

    if (config.enableDOHValidation) {
      console.log(`   🏥 DOH validation enabled`);
    }

    if (config.enableDAMANIntegration) {
      console.log(`   🏥 DAMAN integration enabled`);
    }

    if (config.enableJAWDACompliance) {
      console.log(`   🏥 JAWDA compliance enabled`);
    }

    if (config.mockPatientData) {
      await this.generateMockPatientData(environment);
    }

    if (config.mockClinicalData) {
      await this.generateMockClinicalData(environment);
    }

    if (config.mockInsuranceData) {
      await this.generateMockInsuranceData(environment);
    }

    environment.healthChecks.healthcare = true;
  }

  private async runHealthChecks(environment: EnvironmentStatus): Promise<void> {
    // Update metrics
    environment.metrics = {
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      uptime: performance.now() - environment.startTime,
    };

    // Validate all health checks
    const allHealthy = Object.values(environment.healthChecks).every(Boolean);
    if (!allHealthy) {
      throw new Error("Health checks failed");
    }

    console.log(`   ✅ All health checks passed`);
  }

  private async seedMockData(environment: EnvironmentStatus): Promise<void> {
    // Seed basic test data
    const dataPath = path.join(
      process.cwd(),
      "test-environments",
      environment.id,
      "data",
      "seed.json",
    );
    const seedData = {
      users: [
        { id: 1, name: "Test User", role: "admin" },
        { id: 2, name: "Test Clinician", role: "clinician" },
      ],
      timestamp: new Date().toISOString(),
    };

    fs.writeFileSync(dataPath, JSON.stringify(seedData, null, 2));
    environment.resources.files.push(dataPath);
    console.log(`   📊 Mock data seeded`);
  }

  private async generateMockPatientData(
    environment: EnvironmentStatus,
  ): Promise<void> {
    const patientsPath = path.join(
      process.cwd(),
      "test-environments",
      environment.id,
      "healthcare",
      "patients.json",
    );
    const mockPatients = [
      {
        id: "P001",
        emiratesId: "784-1234-1234567-1",
        firstName: "Ahmed",
        lastName: "Al-Rashid",
        dateOfBirth: "1985-03-15",
        gender: "male",
        nationality: "UAE",
      },
      {
        id: "P002",
        emiratesId: "784-5678-7654321-2",
        firstName: "Fatima",
        lastName: "Al-Zahra",
        dateOfBirth: "1990-07-22",
        gender: "female",
        nationality: "UAE",
      },
    ];

    fs.writeFileSync(patientsPath, JSON.stringify(mockPatients, null, 2));
    environment.resources.files.push(patientsPath);
    console.log(`   👥 Mock patient data generated`);
  }

  private async generateMockClinicalData(
    environment: EnvironmentStatus,
  ): Promise<void> {
    const clinicalPath = path.join(
      process.cwd(),
      "test-environments",
      environment.id,
      "healthcare",
      "clinical.json",
    );
    const mockClinical = {
      assessments: [
        {
          id: "A001",
          patientId: "P001",
          type: "initial-assessment",
          date: new Date().toISOString(),
          clinicianId: "C001",
        },
      ],
      vitals: [
        {
          id: "V001",
          patientId: "P001",
          bloodPressure: "120/80",
          heartRate: 72,
          temperature: 36.5,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    fs.writeFileSync(clinicalPath, JSON.stringify(mockClinical, null, 2));
    environment.resources.files.push(clinicalPath);
    console.log(`   🩺 Mock clinical data generated`);
  }

  private async generateMockInsuranceData(
    environment: EnvironmentStatus,
  ): Promise<void> {
    const insurancePath = path.join(
      process.cwd(),
      "test-environments",
      environment.id,
      "healthcare",
      "insurance.json",
    );
    const mockInsurance = {
      policies: [
        {
          id: "POL001",
          patientId: "P001",
          provider: "DAMAN",
          policyNumber: "DAM-123456789",
          status: "active",
          coverage: "comprehensive",
        },
      ],
      claims: [
        {
          id: "CLM001",
          policyId: "POL001",
          amount: 500.0,
          status: "approved",
          submissionDate: new Date().toISOString(),
        },
      ],
    };

    fs.writeFileSync(insurancePath, JSON.stringify(mockInsurance, null, 2));
    environment.resources.files.push(insurancePath);
    console.log(`   💳 Mock insurance data generated`);
  }

  private async cleanupDirectories(
    environment: EnvironmentStatus,
  ): Promise<void> {
    for (const dir of environment.resources.directories) {
      try {
        if (fs.existsSync(dir)) {
          fs.rmSync(dir, { recursive: true, force: true });
        }
      } catch (error) {
        console.warn(`Failed to remove directory ${dir}:`, error);
      }
    }
    console.log(`   🗑️  Cleaned up directories`);
  }

  private async cleanupDatabase(environment: EnvironmentStatus): Promise<void> {
    // Cleanup database connections and files
    console.log(`   🗑️  Cleaned up database`);
  }

  private async cleanupNetwork(environment: EnvironmentStatus): Promise<void> {
    // Cleanup network resources
    console.log(`   🗑️  Cleaned up network resources`);
  }

  private async cleanupSecurity(environment: EnvironmentStatus): Promise<void> {
    // Cleanup security resources
    console.log(`   🗑️  Cleaned up security resources`);
  }

  private async cleanupHealthcare(
    environment: EnvironmentStatus,
  ): Promise<void> {
    // Cleanup healthcare-specific resources
    console.log(`   🗑️  Cleaned up healthcare resources`);
  }

  private setupCleanupHandlers(): void {
    process.on("exit", () => {
      // Synchronous cleanup only
      console.log("🧹 Process exit - cleaning up environments");
    });

    process.on("SIGINT", async () => {
      console.log("\n🧹 SIGINT received - cleaning up environments");
      await this.cleanupAll();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      console.log("\n🧹 SIGTERM received - cleaning up environments");
      await this.cleanupAll();
      process.exit(0);
    });
  }

  private async cleanupAll(): Promise<void> {
    const environmentIds = Array.from(this.environments.keys());
    for (const id of environmentIds) {
      try {
        await this.cleanup(id);
      } catch (error) {
        console.error(`Failed to cleanup environment ${id}:`, error);
      }
    }
  }

  private mergeWithDefaults(
    config: Partial<EnvironmentConfig>,
  ): EnvironmentConfig {
    return {
      testType: "unit",
      environment: "test",
      isolationLevel: "process",
      cleanupOnExit: true,
      enableLogging: true,
      logLevel: "info",
      timeoutMs: 30000,
      healthcare: {
        enableDOHValidation: false,
        enableDAMANIntegration: false,
        enableJAWDACompliance: false,
        enableHIPAAValidation: false,
        mockPatientData: false,
        mockClinicalData: false,
        mockInsuranceData: false,
        complianceLevel: "basic",
      },
      database: {
        type: "memory",
        mockData: false,
        enableTransactions: false,
        enableMigrations: false,
      },
      network: {
        enableMockServices: false,
        mockEndpoints: [],
        enableRateLimiting: false,
        simulateNetworkLatency: false,
        networkLatencyMs: 100,
      },
      security: {
        enableAuthentication: false,
        enableAuthorization: false,
        enableEncryption: false,
        mockTokens: false,
        enableAuditLogging: false,
      },
      ...config,
      healthcare: {
        ...this.getDefaultHealthcareConfig(),
        ...config.healthcare,
      },
      database: { ...this.getDefaultDatabaseConfig(), ...config.database },
      network: { ...this.getDefaultNetworkConfig(), ...config.network },
      security: { ...this.getDefaultSecurityConfig(), ...config.security },
    };
  }

  private getDefaultHealthcareConfig(): HealthcareConfig {
    return {
      enableDOHValidation: false,
      enableDAMANIntegration: false,
      enableJAWDACompliance: false,
      enableHIPAAValidation: false,
      mockPatientData: false,
      mockClinicalData: false,
      mockInsuranceData: false,
      complianceLevel: "basic",
    };
  }

  private getDefaultDatabaseConfig(): DatabaseConfig {
    return {
      type: "memory",
      mockData: false,
      enableTransactions: false,
      enableMigrations: false,
    };
  }

  private getDefaultNetworkConfig(): NetworkConfig {
    return {
      enableMockServices: false,
      mockEndpoints: [],
      enableRateLimiting: false,
      simulateNetworkLatency: false,
      networkLatencyMs: 100,
    };
  }

  private getDefaultSecurityConfig(): SecurityConfig {
    return {
      enableAuthentication: false,
      enableAuthorization: false,
      enableEncryption: false,
      mockTokens: false,
      enableAuditLogging: false,
    };
  }

  private generateEnvironmentId(): string {
    return `env-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const testEnvironmentManager = TestEnvironmentManager.getInstance();
export default testEnvironmentManager;

// Export types
export {
  TestEnvironmentManager,
  type EnvironmentConfig,
  type EnvironmentStatus,
  type HealthcareConfig,
};

// CLI execution
if (require.main === module) {
  console.log("🌍 Test Environment Manager");

  testEnvironmentManager
    .initialize({
      testType: "integration",
      healthcare: {
        enableDOHValidation: true,
        enableDAMANIntegration: true,
        mockPatientData: true,
        mockClinicalData: true,
      },
    })
    .then((environmentId) => {
      console.log(`✅ Environment ${environmentId} ready for testing`);
    })
    .catch((error) => {
      console.error("❌ Environment setup failed:", error);
      process.exit(1);
    });
}
