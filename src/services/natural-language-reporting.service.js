/**
 * Natural Language Reporting Service
 * Advanced reporting with natural language generation and intelligent insights
 */
import { AuditLogger } from "./security.service";
import { analyticsIntelligenceService } from "./analytics-intelligence.service";
class NaturalLanguageReportingService {
    constructor() {
        Object.defineProperty(this, "templates", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "narrativeTemplates", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "generatedReports", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "languageModels", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        this.initializeDefaultTemplates();
        this.initializeNarrativeTemplates();
        this.initializeLanguageModels();
    }
    static getInstance() {
        if (!NaturalLanguageReportingService.instance) {
            NaturalLanguageReportingService.instance =
                new NaturalLanguageReportingService();
        }
        return NaturalLanguageReportingService.instance;
    }
    /**
     * Initialize default report templates
     */
    initializeDefaultTemplates() {
        const defaultTemplates = [
            {
                id: "doh-compliance-report",
                name: "DOH Compliance Report",
                description: "Comprehensive DOH compliance status and recommendations",
                category: "compliance",
                dataSource: ["compliance_metrics", "audit_logs", "violation_records"],
                parameters: [
                    {
                        name: "reportPeriod",
                        type: "select",
                        required: true,
                        options: ["monthly", "quarterly", "annually"],
                        defaultValue: "monthly",
                    },
                    {
                        name: "includeRecommendations",
                        type: "boolean",
                        required: false,
                        defaultValue: true,
                    },
                ],
                outputFormat: "detailed",
                language: "en",
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: "daman-performance-report",
                name: "Daman Performance Analytics",
                description: "Daman authorization performance and optimization insights",
                category: "financial",
                dataSource: [
                    "daman_submissions",
                    "authorization_data",
                    "denial_records",
                ],
                parameters: [
                    {
                        name: "dateRange",
                        type: "date",
                        required: true,
                    },
                    {
                        name: "providerId",
                        type: "string",
                        required: false,
                    },
                ],
                outputFormat: "executive",
                language: "en",
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: "clinical-outcomes-report",
                name: "Clinical Outcomes Analysis",
                description: "Patient outcomes and clinical performance metrics",
                category: "clinical",
                dataSource: [
                    "patient_records",
                    "treatment_outcomes",
                    "quality_metrics",
                ],
                parameters: [
                    {
                        name: "serviceType",
                        type: "select",
                        required: false,
                        options: ["all", "homecare", "therapy", "nursing"],
                    },
                    {
                        name: "riskLevel",
                        type: "select",
                        required: false,
                        options: ["all", "low", "medium", "high", "critical"],
                    },
                ],
                outputFormat: "detailed",
                language: "en",
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ];
        defaultTemplates.forEach((template) => {
            this.templates.set(template.id, template);
        });
    }
    /**
     * Initialize narrative templates for different report types
     */
    initializeNarrativeTemplates() {
        const narrativeTemplates = [
            {
                id: "compliance-narrative",
                name: "Compliance Report Narrative",
                language: "en",
                tone: "formal",
                structure: [
                    {
                        id: "intro",
                        type: "introduction",
                        template: "This report provides a comprehensive analysis of compliance status for the period {dateRange}. The assessment covers {totalAreas} compliance areas with {totalChecks} individual checks performed.",
                        variables: ["dateRange", "totalAreas", "totalChecks"],
                    },
                    {
                        id: "findings",
                        type: "findings",
                        template: "Our analysis reveals a compliance score of {complianceScore}%, representing {trendDirection} from the previous period. {criticalIssues} critical issues and {minorIssues} minor issues were identified.",
                        variables: [
                            "complianceScore",
                            "trendDirection",
                            "criticalIssues",
                            "minorIssues",
                        ],
                    },
                    {
                        id: "recommendations",
                        type: "recommendations",
                        template: "To address the identified gaps, we recommend implementing {recommendationCount} key initiatives focusing on {primaryFocus}. These measures are expected to improve compliance by {expectedImprovement}%.",
                        variables: [
                            "recommendationCount",
                            "primaryFocus",
                            "expectedImprovement",
                        ],
                    },
                ],
            },
            {
                id: "performance-narrative",
                name: "Performance Report Narrative",
                language: "en",
                tone: "executive",
                structure: [
                    {
                        id: "executive-summary",
                        type: "introduction",
                        template: "Executive Summary: Performance metrics for {reportPeriod} show {overallTrend} with key performance indicators {kpiSummary}. Total submissions: {totalSubmissions}, approval rate: {approvalRate}%.",
                        variables: [
                            "reportPeriod",
                            "overallTrend",
                            "kpiSummary",
                            "totalSubmissions",
                            "approvalRate",
                        ],
                    },
                    {
                        id: "key-insights",
                        type: "analysis",
                        template: "Key insights include {primaryInsight}. Performance benchmarking indicates {benchmarkPosition} relative to industry standards, with {strengthAreas} showing particular strength.",
                        variables: ["primaryInsight", "benchmarkPosition", "strengthAreas"],
                    },
                ],
            },
        ];
        narrativeTemplates.forEach((template) => {
            this.narrativeTemplates.set(template.id, template);
        });
    }
    /**
     * Initialize language models for natural language generation
     */
    initializeLanguageModels() {
        // Initialize language processing capabilities
        this.languageModels.set("en", {
            vocabulary: new Map(),
            grammar: new Map(),
            templates: new Map(),
        });
        this.languageModels.set("ar", {
            vocabulary: new Map(),
            grammar: new Map(),
            templates: new Map(),
        });
    }
    /**
     * Generate intelligent report with natural language narrative
     */
    async generateIntelligentReport(templateId, parameters, options = {}) {
        try {
            const template = this.templates.get(templateId);
            if (!template) {
                throw new Error(`Report template ${templateId} not found`);
            }
            // Validate parameters
            this.validateParameters(template.parameters, parameters);
            // Collect and analyze data
            const rawData = await this.collectReportData(template.dataSource, parameters);
            const analyzedData = await this.analyzeReportData(rawData, template.category);
            // Generate insights and recommendations
            const insights = await this.generateInsights(analyzedData, template.category);
            const recommendations = await this.generateRecommendations(analyzedData, insights);
            // Create visualizations
            const visualizations = options.includeVisualizations
                ? await this.generateVisualizations(analyzedData, template.category)
                : [];
            // Generate natural language narrative
            const narrative = await this.generateNarrative(template, analyzedData, insights, recommendations, options);
            // Create summary
            const summary = await this.generateSummary(analyzedData, insights, recommendations);
            const reportId = this.generateReportId();
            const report = {
                id: reportId,
                templateId,
                title: this.generateReportTitle(template, parameters),
                summary,
                narrative,
                keyInsights: insights,
                recommendations,
                dataVisualization: visualizations,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    generatedBy: "Natural Language Reporting Service",
                    dataRange: this.extractDateRange(parameters),
                    confidence: this.calculateReportConfidence(analyzedData, insights),
                    language: options.language || template.language,
                },
                rawData: analyzedData,
            };
            // Store generated report
            this.generatedReports.set(reportId, report);
            // Log report generation
            AuditLogger.logSecurityEvent({
                type: "system_event",
                details: {
                    action: "report_generated",
                    templateId,
                    reportId,
                    dataPoints: Object.keys(analyzedData).length,
                    insightsCount: insights.length,
                    recommendationsCount: recommendations.length,
                },
                severity: "low",
            });
            return report;
        }
        catch (error) {
            console.error("Failed to generate intelligent report:", error);
            throw error;
        }
    }
    /**
     * Generate natural language narrative from data and insights
     */
    async generateNarrative(template, data, insights, recommendations, options) {
        try {
            const narrativeTemplateId = this.selectNarrativeTemplate(template.category);
            const narrativeTemplate = this.narrativeTemplates.get(narrativeTemplateId);
            if (!narrativeTemplate) {
                return this.generateBasicNarrative(data, insights, recommendations);
            }
            let narrative = "";
            const variables = this.extractNarrativeVariables(data, insights, recommendations);
            for (const section of narrativeTemplate.structure) {
                const sectionText = this.populateTemplate(section.template, variables);
                narrative += sectionText + "\n\n";
            }
            // Apply language-specific formatting
            if (options.language === "ar") {
                narrative = this.formatArabicText(narrative);
            }
            // Apply tone adjustments
            narrative = this.adjustTone(narrative, options.tone || narrativeTemplate.tone);
            return narrative.trim();
        }
        catch (error) {
            console.error("Failed to generate narrative:", error);
            return this.generateBasicNarrative(data, insights, recommendations);
        }
    }
    /**
     * Generate intelligent insights from analyzed data
     */
    async generateInsights(data, category) {
        const insights = [];
        try {
            // Trend analysis
            const trendInsights = this.analyzeTrends(data);
            insights.push(...trendInsights);
            // Anomaly detection
            const anomalyInsights = await this.detectAnomalies(data);
            insights.push(...anomalyInsights);
            // Performance benchmarking
            const benchmarkInsights = await this.generateBenchmarkInsights(data, category);
            insights.push(...benchmarkInsights);
            // Predictive insights
            const predictiveInsights = await this.generatePredictiveInsights(data, category);
            insights.push(...predictiveInsights);
            // Correlation analysis
            const correlationInsights = this.analyzeCorrelations(data);
            insights.push(...correlationInsights);
            return insights.sort((a, b) => {
                const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                return severityOrder[b.significance] - severityOrder[a.significance];
            });
        }
        catch (error) {
            console.error("Failed to generate insights:", error);
            return [];
        }
    }
    /**
     * Generate actionable recommendations based on insights
     */
    async generateRecommendations(data, insights) {
        const recommendations = [];
        try {
            // Process critical insights first
            const criticalInsights = insights.filter((i) => i.significance === "critical");
            for (const insight of criticalInsights) {
                const rec = await this.generateRecommendationFromInsight(insight, "critical");
                if (rec)
                    recommendations.push(rec);
            }
            // Process high priority insights
            const highInsights = insights.filter((i) => i.significance === "high");
            for (const insight of highInsights) {
                const rec = await this.generateRecommendationFromInsight(insight, "high");
                if (rec)
                    recommendations.push(rec);
            }
            // Generate strategic recommendations
            const strategicRecs = await this.generateStrategicRecommendations(data, insights);
            recommendations.push(...strategicRecs);
            return recommendations.slice(0, 10); // Limit to top 10 recommendations
        }
        catch (error) {
            console.error("Failed to generate recommendations:", error);
            return [];
        }
    }
    /**
     * Generate data visualizations for the report
     */
    async generateVisualizations(data, category) {
        const visualizations = [];
        try {
            // Time series visualization
            if (data.timeSeries) {
                visualizations.push({
                    id: "time-series-chart",
                    type: "line",
                    title: "Performance Over Time",
                    description: "Trend analysis of key metrics over the reporting period",
                    data: data.timeSeries,
                    configuration: {
                        xAxis: "date",
                        yAxis: "value",
                        showLegend: true,
                        showGrid: true,
                    },
                });
            }
            // Distribution visualization
            if (data.distribution) {
                visualizations.push({
                    id: "distribution-chart",
                    type: "bar",
                    title: "Distribution Analysis",
                    description: "Distribution of key categories and their performance",
                    data: data.distribution,
                    configuration: {
                        xAxis: "category",
                        yAxis: "count",
                        colorScheme: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"],
                        showLegend: false,
                    },
                });
            }
            // Performance gauge
            if (data.overallScore !== undefined) {
                visualizations.push({
                    id: "performance-gauge",
                    type: "gauge",
                    title: "Overall Performance Score",
                    description: "Composite performance indicator",
                    data: {
                        value: data.overallScore,
                        min: 0,
                        max: 100,
                        thresholds: [30, 60, 80],
                    },
                    configuration: {
                        colorScheme: ["#EF4444", "#F59E0B", "#10B981"],
                    },
                });
            }
            return visualizations;
        }
        catch (error) {
            console.error("Failed to generate visualizations:", error);
            return [];
        }
    }
    /**
     * Collect data from multiple sources for report generation
     */
    async collectReportData(dataSources, parameters) {
        const collectedData = {};
        try {
            for (const source of dataSources) {
                switch (source) {
                    case "compliance_metrics":
                        collectedData.compliance = await this.getComplianceData(parameters);
                        break;
                    case "daman_submissions":
                        collectedData.daman = await this.getDamanData(parameters);
                        break;
                    case "patient_records":
                        collectedData.patients = await this.getPatientData(parameters);
                        break;
                    case "audit_logs":
                        collectedData.audits = await this.getAuditData(parameters);
                        break;
                    default:
                        console.warn(`Unknown data source: ${source}`);
                }
            }
            return collectedData;
        }
        catch (error) {
            console.error("Failed to collect report data:", error);
            throw error;
        }
    }
    /**
     * Analyze collected data and extract meaningful patterns
     */
    async analyzeReportData(rawData, category) {
        try {
            const analyzedData = {
                ...rawData,
                analysis: {},
            };
            // Statistical analysis
            analyzedData.analysis.statistics = this.calculateStatistics(rawData);
            // Trend analysis
            analyzedData.analysis.trends = this.calculateTrends(rawData);
            // Performance metrics
            analyzedData.analysis.performance = this.calculatePerformanceMetrics(rawData, category);
            // Risk assessment
            analyzedData.analysis.risks = this.assessRisks(rawData);
            return analyzedData;
        }
        catch (error) {
            console.error("Failed to analyze report data:", error);
            return rawData;
        }
    }
    // Helper methods for data collection
    async getComplianceData(parameters) {
        // Simulate compliance data retrieval
        return {
            overallScore: 85 + Math.random() * 10,
            violations: Math.floor(Math.random() * 5),
            areas: [
                { name: "DOH Standards", score: 90 },
                { name: "JAWDA Guidelines", score: 88 },
                { name: "ADHICS Requirements", score: 82 },
            ],
        };
    }
    async getDamanData(parameters) {
        // Simulate Daman data retrieval
        return {
            totalSubmissions: Math.floor(Math.random() * 500) + 100,
            approvalRate: 0.75 + Math.random() * 0.2,
            averageProcessingTime: Math.floor(Math.random() * 10) + 5,
            denialReasons: [
                { reason: "Incomplete documentation", count: 15 },
                { reason: "Service not covered", count: 8 },
                { reason: "Prior authorization required", count: 5 },
            ],
        };
    }
    async getPatientData(parameters) {
        // Simulate patient data retrieval
        return {
            totalPatients: Math.floor(Math.random() * 1000) + 200,
            averageAge: 45 + Math.random() * 20,
            riskDistribution: {
                low: 60,
                medium: 25,
                high: 12,
                critical: 3,
            },
            outcomes: {
                improved: 78,
                stable: 18,
                declined: 4,
            },
        };
    }
    async getAuditData(parameters) {
        // Simulate audit data retrieval
        return {
            totalEvents: Math.floor(Math.random() * 10000) + 1000,
            criticalEvents: Math.floor(Math.random() * 50) + 5,
            complianceViolations: Math.floor(Math.random() * 20) + 2,
            userActions: Math.floor(Math.random() * 5000) + 500,
        };
    }
    // Helper methods for analysis
    calculateStatistics(data) {
        return {
            dataPoints: Object.keys(data).length,
            completeness: 0.95,
            quality: 0.88,
            freshness: 0.92,
        };
    }
    calculateTrends(data) {
        return {
            overall: "improving",
            keyMetrics: {
                performance: "stable",
                compliance: "improving",
                efficiency: "declining",
            },
        };
    }
    calculatePerformanceMetrics(data, category) {
        const baseScore = 75 + Math.random() * 20;
        return {
            overallScore: baseScore,
            categoryScore: baseScore + (Math.random() - 0.5) * 10,
            benchmark: 80,
            percentile: Math.floor(baseScore),
        };
    }
    assessRisks(data) {
        return {
            overallRisk: "medium",
            riskFactors: [
                { factor: "Data quality", level: "low" },
                { factor: "Compliance gaps", level: "medium" },
                { factor: "Resource constraints", level: "high" },
            ],
        };
    }
    // Helper methods for insight generation
    analyzeTrends(data) {
        const insights = [];
        if (data.analysis?.trends?.overall === "improving") {
            insights.push({
                type: "trend",
                title: "Positive Performance Trend",
                description: "Overall performance metrics show consistent improvement over the reporting period",
                significance: "medium",
                confidence: 0.85,
                supportingData: data.analysis.trends,
                visualizationType: "chart",
            });
        }
        return insights;
    }
    async detectAnomalies(data) {
        // Use analytics intelligence service for anomaly detection
        try {
            const anomalies = await analyticsIntelligenceService.detectAnomalies([data], "system");
            return anomalies.anomalies.map((anomaly) => ({
                type: "anomaly",
                title: `Anomaly Detected: ${anomaly.type}`,
                description: anomaly.description,
                significance: anomaly.severity,
                confidence: anomaly.confidence / 100,
                supportingData: anomaly,
                visualizationType: "chart",
            }));
        }
        catch (error) {
            console.error("Anomaly detection failed:", error);
            return [];
        }
    }
    async generateBenchmarkInsights(data, category) {
        const insights = [];
        if (data.analysis?.performance) {
            const performance = data.analysis.performance;
            if (performance.overallScore > performance.benchmark) {
                insights.push({
                    type: "benchmark",
                    title: "Above Benchmark Performance",
                    description: `Performance score of ${performance.overallScore.toFixed(1)} exceeds industry benchmark of ${performance.benchmark}`,
                    significance: "high",
                    confidence: 0.9,
                    supportingData: performance,
                    visualizationType: "gauge",
                });
            }
        }
        return insights;
    }
    async generatePredictiveInsights(data, category) {
        const insights = [];
        // Generate predictive insights based on trends
        if (data.analysis?.trends?.overall === "declining") {
            insights.push({
                type: "prediction",
                title: "Performance Decline Prediction",
                description: "Current trends suggest potential performance decline in the next quarter without intervention",
                significance: "high",
                confidence: 0.75,
                supportingData: data.analysis.trends,
                visualizationType: "graph",
            });
        }
        return insights;
    }
    analyzeCorrelations(data) {
        const insights = [];
        // Analyze correlations between different metrics
        if (data.compliance && data.daman) {
            const correlation = this.calculateCorrelation(data.compliance.overallScore, data.daman.approvalRate * 100);
            if (Math.abs(correlation) > 0.7) {
                insights.push({
                    type: "correlation",
                    title: "Strong Correlation Identified",
                    description: `Strong ${correlation > 0 ? "positive" : "negative"} correlation (${correlation.toFixed(2)}) between compliance score and approval rate`,
                    significance: "medium",
                    confidence: 0.8,
                    supportingData: {
                        correlation,
                        metrics: ["compliance", "approval_rate"],
                    },
                    visualizationType: "scatter",
                });
            }
        }
        return insights;
    }
    calculateCorrelation(x, y) {
        // Simplified correlation calculation
        return (Math.random() - 0.5) * 2; // Random correlation for demo
    }
    // Helper methods for recommendation generation
    async generateRecommendationFromInsight(insight, priority) {
        switch (insight.type) {
            case "anomaly":
                return {
                    priority: priority,
                    category: "Risk Management",
                    title: "Address Detected Anomaly",
                    description: `Investigate and resolve the anomaly: ${insight.description}`,
                    actionItems: [
                        "Conduct detailed investigation",
                        "Implement corrective measures",
                        "Monitor for recurrence",
                    ],
                    expectedImpact: 0.2,
                    implementationEffort: "medium",
                    timeline: "2-4 weeks",
                    stakeholders: ["Operations Team", "Quality Assurance"],
                };
            case "trend":
                if (insight.title.includes("Decline")) {
                    return {
                        priority: priority,
                        category: "Performance Improvement",
                        title: "Reverse Negative Trend",
                        description: "Implement measures to address declining performance trends",
                        actionItems: [
                            "Analyze root causes",
                            "Develop improvement plan",
                            "Implement monitoring system",
                        ],
                        expectedImpact: 0.25,
                        implementationEffort: "high",
                        timeline: "1-3 months",
                        stakeholders: ["Management", "Operations Team"],
                    };
                }
                break;
        }
        return null;
    }
    async generateStrategicRecommendations(data, insights) {
        const recommendations = [];
        // Generate strategic recommendations based on overall analysis
        if (data.analysis?.performance?.overallScore < 80) {
            recommendations.push({
                priority: "high",
                category: "Strategic Improvement",
                title: "Comprehensive Performance Enhancement",
                description: "Implement comprehensive performance improvement program",
                actionItems: [
                    "Conduct performance audit",
                    "Develop improvement roadmap",
                    "Implement best practices",
                    "Establish monitoring framework",
                ],
                expectedImpact: 0.3,
                implementationEffort: "high",
                timeline: "3-6 months",
                stakeholders: ["Executive Team", "Department Heads", "Quality Team"],
            });
        }
        return recommendations;
    }
    // Helper methods for narrative generation
    selectNarrativeTemplate(category) {
        switch (category) {
            case "compliance":
                return "compliance-narrative";
            case "financial":
            case "operational":
                return "performance-narrative";
            default:
                return "compliance-narrative";
        }
    }
    extractNarrativeVariables(data, insights, recommendations) {
        return {
            dateRange: "January 2024 - March 2024",
            totalAreas: "12",
            totalChecks: "156",
            complianceScore: data.compliance?.overallScore?.toFixed(1) || "85.0",
            trendDirection: "improvement",
            criticalIssues: insights
                .filter((i) => i.significance === "critical")
                .length.toString(),
            minorIssues: insights
                .filter((i) => i.significance === "low")
                .length.toString(),
            recommendationCount: recommendations.length.toString(),
            primaryFocus: "compliance enhancement",
            expectedImprovement: "15",
            reportPeriod: "Q1 2024",
            overallTrend: "positive performance",
            kpiSummary: "meeting targets",
            totalSubmissions: data.daman?.totalSubmissions?.toString() || "250",
            approvalRate: (data.daman?.approvalRate * 100)?.toFixed(1) || "82.5",
            primaryInsight: insights[0]?.title || "stable performance",
            benchmarkPosition: "above average",
            strengthAreas: "compliance and quality metrics",
        };
    }
    populateTemplate(template, variables) {
        let populated = template;
        Object.entries(variables).forEach(([key, value]) => {
            const placeholder = `{${key}}`;
            populated = populated.replace(new RegExp(placeholder, "g"), value);
        });
        return populated;
    }
    formatArabicText(text) {
        // Apply Arabic text formatting rules
        return text; // Simplified - would implement proper Arabic formatting
    }
    adjustTone(text, tone) {
        // Apply tone adjustments
        switch (tone) {
            case "executive":
                return text.replace(/\b(shows|indicates)\b/g, "demonstrates");
            case "technical":
                return text; // Add technical terminology
            case "casual":
                return text.replace(/\b(demonstrates|indicates)\b/g, "shows");
            default:
                return text;
        }
    }
    generateBasicNarrative(data, insights, recommendations) {
        let narrative = "Report Summary:\n\n";
        narrative += `This report analyzes ${Object.keys(data).length} data sources and identifies ${insights.length} key insights. `;
        narrative += `${recommendations.length} recommendations have been generated to address identified opportunities.\n\n`;
        if (insights.length > 0) {
            narrative += "Key Findings:\n";
            insights.slice(0, 3).forEach((insight, index) => {
                narrative += `${index + 1}. ${insight.title}: ${insight.description}\n`;
            });
            narrative += "\n";
        }
        if (recommendations.length > 0) {
            narrative += "Recommendations:\n";
            recommendations.slice(0, 3).forEach((rec, index) => {
                narrative += `${index + 1}. ${rec.title}: ${rec.description}\n`;
            });
        }
        return narrative;
    }
    generateSummary(data, insights, recommendations) {
        const criticalInsights = insights.filter((i) => i.significance === "critical").length;
        const highPriorityRecs = recommendations.filter((r) => r.priority === "critical" || r.priority === "high").length;
        return (`Analysis of ${Object.keys(data).length} data sources revealed ${insights.length} insights ` +
            `(${criticalInsights} critical) and generated ${recommendations.length} recommendations ` +
            `(${highPriorityRecs} high priority). Overall system performance is within acceptable parameters ` +
            `with opportunities for optimization identified.`);
    }
    // Utility methods
    validateParameters(templateParams, providedParams) {
        for (const param of templateParams) {
            if (param.required && !(param.name in providedParams)) {
                throw new Error(`Required parameter '${param.name}' is missing`);
            }
            if (param.name in providedParams) {
                const value = providedParams[param.name];
                // Type validation
                if (param.type === "number" && typeof value !== "number") {
                    throw new Error(`Parameter '${param.name}' must be a number`);
                }
                if (param.type === "boolean" && typeof value !== "boolean") {
                    throw new Error(`Parameter '${param.name}' must be a boolean`);
                }
                // Options validation
                if (param.options && !param.options.includes(value)) {
                    throw new Error(`Parameter '${param.name}' must be one of: ${param.options.join(", ")}`);
                }
                // Range validation
                if (param.validation) {
                    if (param.validation.min !== undefined &&
                        value < param.validation.min) {
                        throw new Error(`Parameter '${param.name}' must be at least ${param.validation.min}`);
                    }
                    if (param.validation.max !== undefined &&
                        value > param.validation.max) {
                        throw new Error(`Parameter '${param.name}' must be at most ${param.validation.max}`);
                    }
                }
            }
        }
    }
    generateReportId() {
        return `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    generateReportTitle(template, parameters) {
        const date = new Date().toLocaleDateString();
        return `${template.name} - ${date}`;
    }
    extractDateRange(parameters) {
        const endDate = new Date().toISOString();
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        return {
            startDate: parameters.startDate || startDate,
            endDate: parameters.endDate || endDate,
        };
    }
    calculateReportConfidence(data, insights) {
        const dataQuality = data.analysis?.statistics?.quality || 0.8;
        const insightConfidence = insights.length > 0
            ? insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length
            : 0.7;
        return (dataQuality + insightConfidence) / 2;
    }
    /**
     * Get available report templates
     */
    getAvailableTemplates() {
        return Array.from(this.templates.values()).filter((t) => t.isActive);
    }
    /**
     * Get generated report by ID
     */
    getGeneratedReport(reportId) {
        return this.generatedReports.get(reportId) || null;
    }
    /**
     * Export report in different formats
     */
    async exportReport(reportId, format) {
        const report = this.generatedReports.get(reportId);
        if (!report) {
            throw new Error(`Report ${reportId} not found`);
        }
        switch (format) {
            case "json":
                return {
                    data: JSON.stringify(report, null, 2),
                    mimeType: "application/json",
                    filename: `${report.title.replace(/\s+/g, "_")}.json`,
                };
            case "html":
                const html = this.generateHTMLReport(report);
                return {
                    data: html,
                    mimeType: "text/html",
                    filename: `${report.title.replace(/\s+/g, "_")}.html`,
                };
            default:
                throw new Error(`Export format ${format} not supported`);
        }
    }
    generateHTMLReport(report) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${report.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { border-bottom: 2px solid #333; padding-bottom: 20px; }
          .section { margin: 30px 0; }
          .insight { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .recommendation { background: #e8f4fd; padding: 15px; margin: 10px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${report.title}</h1>
          <p>Generated: ${new Date(report.metadata.generatedAt).toLocaleString()}</p>
        </div>
        
        <div class="section">
          <h2>Executive Summary</h2>
          <p>${report.summary}</p>
        </div>
        
        <div class="section">
          <h2>Detailed Analysis</h2>
          <div>${report.narrative.replace(/\n/g, "<br>")}</div>
        </div>
        
        <div class="section">
          <h2>Key Insights</h2>
          ${report.keyInsights
            .map((insight) => `
            <div class="insight">
              <h3>${insight.title}</h3>
              <p>${insight.description}</p>
              <small>Significance: ${insight.significance} | Confidence: ${(insight.confidence * 100).toFixed(1)}%</small>
            </div>
          `)
            .join("")}
        </div>
        
        <div class="section">
          <h2>Recommendations</h2>
          ${report.recommendations
            .map((rec) => `
            <div class="recommendation">
              <h3>${rec.title}</h3>
              <p>${rec.description}</p>
              <p><strong>Priority:</strong> ${rec.priority}</p>
              <p><strong>Timeline:</strong> ${rec.timeline}</p>
              <ul>
                ${rec.actionItems.map((item) => `<li>${item}</li>`).join("")}
              </ul>
            </div>
          `)
            .join("")}
        </div>
      </body>
      </html>
    `;
    }
}
export const naturalLanguageReportingService = NaturalLanguageReportingService.getInstance();
export default NaturalLanguageReportingService;
