// P4-001: Database Query Optimization & Connection Pooling Enhancement
// Advanced database optimization service for healthcare platform

import { DATABASE_CONFIG } from "@/config/database.config";
import { errorHandlerService } from "./error-handler.service";
import { performanceMonitoringService } from "./performance-monitoring.service";

interface QueryOptimizationResult {
  originalQuery: string;
  optimizedQuery: string;
  estimatedImprovement: number;
  optimizationTechniques: string[];
  executionPlan?: any;
}

interface ConnectionPoolMetrics {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingRequests: number;
  averageWaitTime: number;
  connectionErrors: number;
  queryThroughput: number;
  averageQueryTime: number;
}

interface SlowQueryAnalysis {
  queryId: string;
  query: string;
  executionTime: number;
  frequency: number;
  tables: string[];
  suggestedOptimizations: string[];
  indexRecommendations: string[];
}

class DatabaseOptimizationService {
  private connectionPool: Map<string, any> = new Map();
  private queryCache: Map<string, any> = new Map();
  private slowQueries: Map<string, SlowQueryAnalysis> = new Map();
  private optimizationRules: OptimizationRule[] = [];
  private metrics: ConnectionPoolMetrics;
  private isMonitoring = false;

  constructor() {
    this.metrics = {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      waitingRequests: 0,
      averageWaitTime: 0,
      connectionErrors: 0,
      queryThroughput: 0,
      averageQueryTime: 0,
    };
    this.initializeOptimizationRules();
    this.startMonitoring();
  }

  private initializeOptimizationRules(): void {
    this.optimizationRules = [
      {
        name: "index_optimization",
        description: "Add missing indexes for WHERE clauses",
        pattern: /WHERE\s+(\w+)\s*=/gi,
        apply: (query: string) => {
          const matches = query.match(/WHERE\s+(\w+)\s*=/gi);
          if (matches) {
            const suggestions = matches.map((match) => {
              const column = match.replace(/WHERE\s+|\s*=/gi, "");
              return `CREATE INDEX IF NOT EXISTS idx_${column} ON table_name(${column})`;
            });
            return {
              optimized: true,
              query,
              suggestions,
              improvement: 0.4,
            };
          }
          return { optimized: false, query, suggestions: [], improvement: 0 };
        },
      },
      {
        name: "join_optimization",
        description: "Optimize JOIN operations",
        pattern: /LEFT\s+JOIN/gi,
        apply: (query: string) => {
          if (query.includes("WHERE") && query.includes("LEFT JOIN")) {
            const optimizedQuery = query.replace(/LEFT\s+JOIN/gi, "INNER JOIN");
            return {
              optimized: true,
              query: optimizedQuery,
              suggestions: ["Converted LEFT JOIN to INNER JOIN where possible"],
              improvement: 0.3,
            };
          }
          return { optimized: false, query, suggestions: [], improvement: 0 };
        },
      },
      {
        name: "limit_optimization",
        description: "Add LIMIT clause for large result sets",
        pattern: /SELECT.*FROM/gi,
        apply: (query: string) => {
          if (!query.includes("LIMIT") && !query.includes("COUNT")) {
            const optimizedQuery = `${query} LIMIT 1000`;
            return {
              optimized: true,
              query: optimizedQuery,
              suggestions: ["Added LIMIT clause to prevent large result sets"],
              improvement: 0.5,
            };
          }
          return { optimized: false, query, suggestions: [], improvement: 0 };
        },
      },
      {
        name: "subquery_optimization",
        description: "Convert correlated subqueries to JOINs",
        pattern: /EXISTS\s*\(/gi,
        apply: (query: string) => {
          if (query.includes("EXISTS")) {
            return {
              optimized: true,
              query,
              suggestions: [
                "Consider converting EXISTS subquery to JOIN for better performance",
              ],
              improvement: 0.6,
            };
          }
          return { optimized: false, query, suggestions: [], improvement: 0 };
        },
      },
      {
        name: "healthcare_specific_optimization",
        description: "Healthcare-specific query optimizations",
        pattern: /patient_id|episode_id|clinical_form_id/gi,
        apply: (query: string) => {
          const healthcareColumns = query.match(
            /patient_id|episode_id|clinical_form_id/gi,
          );
          if (healthcareColumns) {
            const suggestions = [
              "Ensure composite indexes on (patient_id, created_at) for time-based queries",
              "Consider partitioning large tables by date for better performance",
              "Use covering indexes for frequently accessed columns",
            ];
            return {
              optimized: true,
              query,
              suggestions,
              improvement: 0.4,
            };
          }
          return { optimized: false, query, suggestions: [], improvement: 0 };
        },
      },
    ];
  }

  async optimizeQuery(
    query: string,
    parameters?: any[],
  ): Promise<QueryOptimizationResult> {
    try {
      const startTime = Date.now();
      let optimizedQuery = query;
      const appliedTechniques: string[] = [];
      let totalImprovement = 0;
      const allSuggestions: string[] = [];

      // Apply optimization rules
      for (const rule of this.optimizationRules) {
        const result = rule.apply(optimizedQuery);
        if (result.optimized) {
          optimizedQuery = result.query;
          appliedTechniques.push(rule.name);
          totalImprovement += result.improvement;
          allSuggestions.push(...result.suggestions);
        }
      }

      // Generate execution plan analysis
      const executionPlan = await this.analyzeExecutionPlan(optimizedQuery);

      // Record optimization metrics
      performanceMonitoringService.recordMetric({
        type: "database",
        name: "Query_Optimization",
        value: Date.now() - startTime,
        unit: "ms",
        metadata: {
          originalQuery: query.substring(0, 100),
          appliedTechniques,
          estimatedImprovement: totalImprovement,
        },
      });

      return {
        originalQuery: query,
        optimizedQuery,
        estimatedImprovement: Math.min(totalImprovement, 1.0),
        optimizationTechniques: appliedTechniques,
        executionPlan,
      };
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "DatabaseOptimizationService.optimizeQuery",
        query: query.substring(0, 100),
      });
      throw error;
    }
  }

  private async analyzeExecutionPlan(query: string): Promise<any> {
    // Mock execution plan analysis - in production would use EXPLAIN ANALYZE
    return {
      estimatedCost: Math.random() * 1000,
      estimatedRows: Math.floor(Math.random() * 10000),
      indexUsage: Math.random() > 0.5,
      joinType: "nested_loop",
      recommendations: [
        "Consider adding index on frequently filtered columns",
        "Review JOIN order for optimal performance",
      ],
    };
  }

  async analyzeSlowQueries(): Promise<SlowQueryAnalysis[]> {
    try {
      // Simulate slow query analysis
      const slowQueries: SlowQueryAnalysis[] = [
        {
          queryId: "sq_001",
          query: "SELECT * FROM patients WHERE created_at > ?",
          executionTime: 2500,
          frequency: 150,
          tables: ["patients"],
          suggestedOptimizations: [
            "Add index on created_at column",
            "Consider using LIMIT clause",
            "Add covering index for frequently selected columns",
          ],
          indexRecommendations: [
            "CREATE INDEX idx_patients_created_at ON patients(created_at)",
            "CREATE INDEX idx_patients_covering ON patients(id, name, status, created_at)",
          ],
        },
        {
          queryId: "sq_002",
          query:
            "SELECT cf.*, p.name FROM clinical_forms cf LEFT JOIN patients p ON cf.patient_id = p.id",
          executionTime: 1800,
          frequency: 200,
          tables: ["clinical_forms", "patients"],
          suggestedOptimizations: [
            "Convert LEFT JOIN to INNER JOIN if possible",
            "Add composite index on patient_id",
            "Consider query result caching",
          ],
          indexRecommendations: [
            "CREATE INDEX idx_clinical_forms_patient_id ON clinical_forms(patient_id)",
            "CREATE INDEX idx_patients_id_name ON patients(id, name)",
          ],
        },
      ];

      // Store slow queries for monitoring
      slowQueries.forEach((sq) => {
        this.slowQueries.set(sq.queryId, sq);
      });

      return slowQueries;
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "DatabaseOptimizationService.analyzeSlowQueries",
      });
      return [];
    }
  }

  async optimizeConnectionPool(): Promise<void> {
    try {
      const currentConfig = DATABASE_CONFIG.pool;
      const recommendations = [];

      // Analyze current pool performance
      if (this.metrics.averageWaitTime > 1000) {
        recommendations.push("Increase max connections in pool");
      }

      if (this.metrics.connectionErrors > 10) {
        recommendations.push("Review connection timeout settings");
      }

      if (this.metrics.idleConnections > this.metrics.activeConnections * 2) {
        recommendations.push("Reduce idle timeout to free unused connections");
      }

      // Apply optimizations
      const optimizedConfig = {
        ...currentConfig,
        max: Math.min(currentConfig.max + 5, 50),
        min: Math.max(currentConfig.min, 5),
        idleTimeoutMillis:
          this.metrics.idleConnections > 20
            ? 20000
            : currentConfig.idleTimeoutMillis,
      };

      console.log(
        "Connection pool optimization recommendations:",
        recommendations,
      );
      console.log("Optimized pool configuration:", optimizedConfig);
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "DatabaseOptimizationService.optimizeConnectionPool",
      });
    }
  }

  async generateIndexRecommendations(tableName: string): Promise<string[]> {
    try {
      // Healthcare-specific index recommendations
      const healthcareIndexes = {
        patients: [
          "CREATE INDEX IF NOT EXISTS idx_patients_emirates_id ON patients(emirates_id)",
          "CREATE INDEX IF NOT EXISTS idx_patients_status_created ON patients(status, created_at)",
          "CREATE INDEX IF NOT EXISTS idx_patients_name_search ON patients USING gin(to_tsvector('english', name))",
        ],
        clinical_forms: [
          "CREATE INDEX IF NOT EXISTS idx_clinical_forms_patient_date ON clinical_forms(patient_id, created_at)",
          "CREATE INDEX IF NOT EXISTS idx_clinical_forms_type_status ON clinical_forms(form_type, status)",
          "CREATE INDEX IF NOT EXISTS idx_clinical_forms_episode ON clinical_forms(episode_id)",
        ],
        episodes: [
          "CREATE INDEX IF NOT EXISTS idx_episodes_patient_status ON episodes(patient_id, status)",
          "CREATE INDEX IF NOT EXISTS idx_episodes_start_date ON episodes(start_date)",
          "CREATE INDEX IF NOT EXISTS idx_episodes_service_type ON episodes(service_type)",
        ],
        assessments: [
          "CREATE INDEX IF NOT EXISTS idx_assessments_patient_type ON assessments(patient_id, assessment_type)",
          "CREATE INDEX IF NOT EXISTS idx_assessments_date_score ON assessments(assessment_date, total_score)",
          "CREATE INDEX IF NOT EXISTS idx_assessments_clinician ON assessments(clinician_id)",
        ],
      };

      return (
        healthcareIndexes[tableName] || [
          `CREATE INDEX IF NOT EXISTS idx_${tableName}_created_at ON ${tableName}(created_at)`,
          `CREATE INDEX IF NOT EXISTS idx_${tableName}_updated_at ON ${tableName}(updated_at)`,
        ]
      );
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "DatabaseOptimizationService.generateIndexRecommendations",
        tableName,
      });
      return [];
    }
  }

  private startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Monitor connection pool metrics
    setInterval(() => {
      this.updateMetrics();
    }, 30000); // Every 30 seconds

    // Analyze slow queries periodically
    setInterval(() => {
      this.analyzeSlowQueries();
    }, 300000); // Every 5 minutes

    console.log("Database optimization monitoring started");
  }

  private updateMetrics(): void {
    // Simulate metrics collection
    this.metrics = {
      totalConnections: Math.floor(Math.random() * 20) + 10,
      activeConnections: Math.floor(Math.random() * 15) + 5,
      idleConnections: Math.floor(Math.random() * 10) + 2,
      waitingRequests: Math.floor(Math.random() * 5),
      averageWaitTime: Math.random() * 500 + 100,
      connectionErrors: Math.floor(Math.random() * 3),
      queryThroughput: Math.random() * 1000 + 500,
      averageQueryTime: Math.random() * 200 + 50,
    };

    // Record metrics for monitoring
    performanceMonitoringService.recordMetric({
      type: "database",
      name: "Connection_Pool_Active",
      value: this.metrics.activeConnections,
      unit: "connections",
    });

    performanceMonitoringService.recordMetric({
      type: "database",
      name: "Average_Query_Time",
      value: this.metrics.averageQueryTime,
      unit: "ms",
    });
  }

  getMetrics(): ConnectionPoolMetrics {
    return { ...this.metrics };
  }

  getSlowQueries(): SlowQueryAnalysis[] {
    return Array.from(this.slowQueries.values());
  }

  async executeOptimizedQuery(query: string, parameters?: any[]): Promise<any> {
    try {
      const startTime = Date.now();

      // Optimize query first
      const optimization = await this.optimizeQuery(query, parameters);

      // Execute optimized query (mock execution)
      const result = {
        rows: [],
        rowCount: Math.floor(Math.random() * 100),
        executionTime: Date.now() - startTime,
      };

      // Record performance metrics
      performanceMonitoringService.recordMetric({
        type: "database",
        name: "Optimized_Query_Execution",
        value: result.executionTime,
        unit: "ms",
        metadata: {
          rowCount: result.rowCount,
          optimizationApplied: optimization.optimizationTechniques.length > 0,
        },
      });

      return result;
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "DatabaseOptimizationService.executeOptimizedQuery",
        query: query.substring(0, 100),
      });
      throw error;
    }
  }

  async getOptimizationReport(): Promise<any> {
    try {
      const slowQueries = await this.analyzeSlowQueries();
      const metrics = this.getMetrics();

      return {
        timestamp: new Date(),
        connectionPoolMetrics: metrics,
        slowQueries: slowQueries.slice(0, 10),
        optimizationRules: this.optimizationRules.length,
        recommendations: [
          "Implement suggested indexes for slow queries",
          "Consider query result caching for frequently accessed data",
          "Review connection pool configuration based on current metrics",
          "Implement database partitioning for large tables",
        ],
        healthScore: this.calculateHealthScore(),
      };
    } catch (error) {
      errorHandlerService.handleError(error, {
        context: "DatabaseOptimizationService.getOptimizationReport",
      });
      return null;
    }
  }

  private calculateHealthScore(): number {
    let score = 100;

    // Deduct points for performance issues
    if (this.metrics.averageQueryTime > 200) score -= 20;
    if (this.metrics.averageWaitTime > 1000) score -= 15;
    if (this.metrics.connectionErrors > 5) score -= 25;
    if (this.slowQueries.size > 10) score -= 20;

    return Math.max(score, 0);
  }
}

interface OptimizationRule {
  name: string;
  description: string;
  pattern: RegExp;
  apply: (query: string) => {
    optimized: boolean;
    query: string;
    suggestions: string[];
    improvement: number;
  };
}

export const databaseOptimizationService = new DatabaseOptimizationService();
export { QueryOptimizationResult, ConnectionPoolMetrics, SlowQueryAnalysis };
export default databaseOptimizationService;
