import express from "express";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

const router = express.Router();

interface DataPolicy {
  id: string;
  name: string;
  description: string;
  type:
    | "access_control"
    | "data_retention"
    | "data_quality"
    | "privacy"
    | "compliance";
  status: "active" | "inactive" | "draft";
  rules: PolicyRule[];
  applicableDatasets: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: string;
  approvedBy?: string;
  approvedAt?: Date;
}

interface PolicyRule {
  id: string;
  condition: string;
  action: string;
  parameters: Record<string, any>;
  priority: number;
  enabled: boolean;
}

interface DataLineage {
  id: string;
  datasetId: string;
  source: {
    system: string;
    table: string;
    fields: string[];
  };
  transformations: Transformation[];
  destination: {
    system: string;
    table: string;
    fields: string[];
  };
  createdAt: Date;
  lastUpdated: Date;
}

interface Transformation {
  id: string;
  type: "filter" | "aggregate" | "join" | "enrich" | "anonymize";
  description: string;
  inputFields: string[];
  outputFields: string[];
  logic: string;
  appliedAt: Date;
}

interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  result: "success" | "failure" | "warning";
  policyViolations?: string[];
}

interface DataQualityRule {
  id: string;
  name: string;
  description: string;
  dataset: string;
  field?: string;
  ruleType:
    | "completeness"
    | "accuracy"
    | "consistency"
    | "validity"
    | "uniqueness";
  condition: string;
  threshold: number;
  severity: "low" | "medium" | "high" | "critical";
  enabled: boolean;
  lastChecked?: Date;
  violations?: number;
}

interface ComplianceReport {
  id: string;
  reportType: "doh" | "daman" | "adhics" | "hipaa" | "gdpr";
  period: {
    start: Date;
    end: Date;
  };
  status: "compliant" | "non_compliant" | "partial_compliance";
  score: number;
  findings: ComplianceFinding[];
  recommendations: string[];
  generatedAt: Date;
  generatedBy: string;
}

interface ComplianceFinding {
  id: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  evidence: string[];
  remediation: string;
  dueDate?: Date;
  status: "open" | "in_progress" | "resolved";
}

// Mock data
const mockPolicies: DataPolicy[] = [
  {
    id: "policy-patient-data-access",
    name: "Patient Data Access Control",
    description:
      "Controls access to patient sensitive information based on role and need-to-know",
    type: "access_control",
    status: "active",
    rules: [
      {
        id: "rule-001",
        condition:
          'user.role == "clinician" AND patient.assigned_clinician == user.id',
        action: "allow_full_access",
        parameters: { fields: ["*"] },
        priority: 1,
        enabled: true,
      },
      {
        id: "rule-002",
        condition:
          'user.role == "nurse" AND patient.care_team.includes(user.id)',
        action: "allow_limited_access",
        parameters: { fields: ["demographics", "vital_signs", "medications"] },
        priority: 2,
        enabled: true,
      },
      {
        id: "rule-003",
        condition: 'user.role == "billing"',
        action: "allow_billing_access",
        parameters: { fields: ["demographics", "insurance", "billing_codes"] },
        priority: 3,
        enabled: true,
      },
    ],
    applicableDatasets: ["patient_data", "clinical_assessments"],
    createdBy: "admin@reyada.ae",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-15"),
    version: "2.1.0",
    approvedBy: "compliance@reyada.ae",
    approvedAt: new Date("2024-01-15"),
  },
  {
    id: "policy-data-retention",
    name: "Healthcare Data Retention Policy",
    description:
      "Defines retention periods for different types of healthcare data",
    type: "data_retention",
    status: "active",
    rules: [
      {
        id: "rule-004",
        condition: 'data.type == "clinical_records"',
        action: "retain",
        parameters: { period: "10_years", archive_after: "2_years" },
        priority: 1,
        enabled: true,
      },
      {
        id: "rule-005",
        condition: 'data.type == "audit_logs"',
        action: "retain",
        parameters: { period: "7_years", archive_after: "1_year" },
        priority: 2,
        enabled: true,
      },
      {
        id: "rule-006",
        condition: 'data.type == "temporary_files"',
        action: "delete",
        parameters: { period: "30_days" },
        priority: 3,
        enabled: true,
      },
    ],
    applicableDatasets: ["*"],
    createdBy: "admin@reyada.ae",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-10"),
    version: "1.0.0",
    approvedBy: "legal@reyada.ae",
    approvedAt: new Date("2024-01-10"),
  },
];

const mockAuditLogs: AuditLog[] = [];
const mockDataQualityRules: DataQualityRule[] = [
  {
    id: "dq-rule-001",
    name: "Patient ID Completeness",
    description: "Ensure all patient records have a valid patient ID",
    dataset: "patient_data",
    field: "patient_id",
    ruleType: "completeness",
    condition: 'patient_id IS NOT NULL AND patient_id != ""',
    threshold: 100,
    severity: "critical",
    enabled: true,
    lastChecked: new Date(),
    violations: 0,
  },
  {
    id: "dq-rule-002",
    name: "Email Format Validation",
    description: "Validate email addresses follow proper format",
    dataset: "patient_data",
    field: "email",
    ruleType: "validity",
    condition:
      'email REGEXP "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"',
    threshold: 95,
    severity: "medium",
    enabled: true,
    lastChecked: new Date(),
    violations: 3,
  },
];

const mockLineage: DataLineage[] = [
  {
    id: "lineage-001",
    datasetId: "patient_analytics",
    source: {
      system: "patient_management",
      table: "patients",
      fields: ["patient_id", "name", "date_of_birth", "gender"],
    },
    transformations: [
      {
        id: "transform-001",
        type: "anonymize",
        description: "Hash patient names for privacy",
        inputFields: ["name"],
        outputFields: ["name_hash"],
        logic: "SHA256(name + salt)",
        appliedAt: new Date("2024-01-15T10:00:00Z"),
      },
      {
        id: "transform-002",
        type: "enrich",
        description: "Calculate age from date of birth",
        inputFields: ["date_of_birth"],
        outputFields: ["age", "age_group"],
        logic: "DATEDIFF(CURRENT_DATE, date_of_birth) / 365",
        appliedAt: new Date("2024-01-15T10:05:00Z"),
      },
    ],
    destination: {
      system: "analytics_warehouse",
      table: "patient_demographics",
      fields: ["patient_id", "name_hash", "age", "age_group", "gender"],
    },
    createdAt: new Date("2024-01-15"),
    lastUpdated: new Date("2024-01-15"),
  },
];

// Helper functions
const generateId = (): string => uuidv4();

const logAuditEvent = (
  userId: string,
  action: string,
  resource: string,
  resourceId: string,
  details: any,
  req: Request,
  result: "success" | "failure" | "warning" = "success",
  policyViolations?: string[],
) => {
  const auditLog: AuditLog = {
    id: generateId(),
    timestamp: new Date(),
    userId,
    action,
    resource,
    resourceId,
    details,
    ipAddress: req.ip || "unknown",
    userAgent: req.get("User-Agent") || "unknown",
    result,
    policyViolations,
  };

  mockAuditLogs.push(auditLog);

  // Keep only last 10000 logs for demo
  if (mockAuditLogs.length > 10000) {
    mockAuditLogs.splice(0, mockAuditLogs.length - 10000);
  }
};

const evaluatePolicy = (
  policy: DataPolicy,
  context: any,
): { allowed: boolean; violations: string[] } => {
  const violations: string[] = [];
  let allowed = false;

  for (const rule of policy.rules
    .filter((r) => r.enabled)
    .sort((a, b) => a.priority - b.priority)) {
    try {
      // Simple rule evaluation (in production, use a proper rule engine)
      const condition = rule.condition
        .replace(/user\.role/g, `"${context.user?.role || ""}"`)
        .replace(/user\.id/g, `"${context.user?.id || ""}"`);

      // For demo purposes, assume rules pass based on role
      if (context.user?.role === "admin") {
        allowed = true;
        break;
      } else if (
        context.user?.role === "clinician" &&
        rule.condition.includes("clinician")
      ) {
        allowed = true;
        break;
      } else if (
        context.user?.role === "nurse" &&
        rule.condition.includes("nurse")
      ) {
        allowed = true;
        break;
      }
    } catch (error) {
      violations.push(`Rule evaluation error: ${rule.id}`);
    }
  }

  if (!allowed && violations.length === 0) {
    violations.push("No matching policy rules found");
  }

  return { allowed, violations };
};

// API Routes

/**
 * @route GET /api/data-governance/policies
 * @desc Get all data governance policies
 */
router.get("/policies", async (req: Request, res: Response) => {
  try {
    const { type, status, limit = 50 } = req.query;

    let policies = mockPolicies;

    if (type) {
      policies = policies.filter((p) => p.type === type);
    }

    if (status) {
      policies = policies.filter((p) => p.status === status);
    }

    policies = policies.slice(0, parseInt(limit as string));

    logAuditEvent(
      (req.headers["user-id"] as string) || "anonymous",
      "view_policies",
      "data_governance",
      "policies",
      { filters: { type, status, limit } },
      req,
    );

    res.json({
      success: true,
      data: policies,
      total: policies.length,
      summary: {
        active: mockPolicies.filter((p) => p.status === "active").length,
        inactive: mockPolicies.filter((p) => p.status === "inactive").length,
        draft: mockPolicies.filter((p) => p.status === "draft").length,
      },
    });
  } catch (error) {
    console.error("Get policies error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve policies",
    });
  }
});

/**
 * @route POST /api/data-governance/policies
 * @desc Create a new data governance policy
 */
router.post("/policies", async (req: Request, res: Response) => {
  try {
    const { name, description, type, rules, applicableDatasets } = req.body;
    const userId = (req.headers["user-id"] as string) || "anonymous";

    if (!name || !description || !type || !rules) {
      return res.status(400).json({
        success: false,
        error: "Name, description, type, and rules are required",
      });
    }

    const policy: DataPolicy = {
      id: `policy-${generateId()}`,
      name,
      description,
      type,
      status: "draft",
      rules: rules.map((rule: any, index: number) => ({
        id: `rule-${generateId()}`,
        ...rule,
        priority: rule.priority || index + 1,
        enabled: rule.enabled !== false,
      })),
      applicableDatasets: applicableDatasets || ["*"],
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: "1.0.0",
    };

    mockPolicies.push(policy);

    logAuditEvent(
      userId,
      "create_policy",
      "data_governance",
      policy.id,
      { policyName: name, type, rulesCount: rules.length },
      req,
    );

    res.json({
      success: true,
      data: policy,
      message: "Policy created successfully",
    });
  } catch (error) {
    console.error("Create policy error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create policy",
    });
  }
});

/**
 * @route POST /api/data-governance/policies/:policyId/evaluate
 * @desc Evaluate a policy against a given context
 */
router.post(
  "/policies/:policyId/evaluate",
  async (req: Request, res: Response) => {
    try {
      const { policyId } = req.params;
      const { context } = req.body;
      const userId = (req.headers["user-id"] as string) || "anonymous";

      const policy = mockPolicies.find((p) => p.id === policyId);
      if (!policy) {
        return res.status(404).json({
          success: false,
          error: "Policy not found",
        });
      }

      if (policy.status !== "active") {
        return res.status(400).json({
          success: false,
          error: "Policy is not active",
        });
      }

      const evaluation = evaluatePolicy(policy, context);

      logAuditEvent(
        userId,
        "evaluate_policy",
        "data_governance",
        policyId,
        { context, result: evaluation },
        req,
        evaluation.allowed ? "success" : "warning",
        evaluation.violations,
      );

      res.json({
        success: true,
        policyId,
        evaluation,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Policy evaluation error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to evaluate policy",
      });
    }
  },
);

/**
 * @route GET /api/data-governance/audit-logs
 * @desc Get audit logs with filtering
 */
router.get("/audit-logs", async (req: Request, res: Response) => {
  try {
    const {
      userId,
      action,
      resource,
      startDate,
      endDate,
      result,
      limit = 100,
      offset = 0,
    } = req.query;

    let logs = [...mockAuditLogs].reverse(); // Most recent first

    // Apply filters
    if (userId) {
      logs = logs.filter((log) => log.userId === userId);
    }

    if (action) {
      logs = logs.filter((log) => log.action.includes(action as string));
    }

    if (resource) {
      logs = logs.filter((log) => log.resource === resource);
    }

    if (result) {
      logs = logs.filter((log) => log.result === result);
    }

    if (startDate) {
      const start = new Date(startDate as string);
      logs = logs.filter((log) => log.timestamp >= start);
    }

    if (endDate) {
      const end = new Date(endDate as string);
      logs = logs.filter((log) => log.timestamp <= end);
    }

    // Pagination
    const total = logs.length;
    const paginatedLogs = logs.slice(
      parseInt(offset as string),
      parseInt(offset as string) + parseInt(limit as string),
    );

    logAuditEvent(
      (req.headers["user-id"] as string) || "anonymous",
      "view_audit_logs",
      "data_governance",
      "audit_logs",
      { filters: { userId, action, resource, startDate, endDate, result } },
      req,
    );

    res.json({
      success: true,
      data: paginatedLogs,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: parseInt(offset as string) + parseInt(limit as string) < total,
      },
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve audit logs",
    });
  }
});
