// Redis Cluster Configuration
export const REDIS_CLUSTER_CONFIG = {
    primary: {
        host: process.env.REDIS_CLUSTER_PRIMARY_HOST ||
            "reyada-redis-cluster-primary.xxxxxx.clustercfg.me-south-1.cache.amazonaws.com",
        port: parseInt(process.env.REDIS_CLUSTER_PRIMARY_PORT || "6379"),
        password: process.env.REDIS_CLUSTER_PRIMARY_PASSWORD || "",
        region: "me-south-1",
        nodeType: "cache.r6g.xlarge",
        numNodeGroups: 3,
        replicasPerNodeGroup: 2,
        multiAZ: true,
        transitEncryption: true,
        atRestEncryption: true,
        backupRetentionPeriod: 5,
        snapshotWindow: "03:00-05:00",
        maintenanceWindow: "sun:05:00-sun:07:00",
        clusterMode: {
            enabled: true,
            parameterGroupName: "default.redis7.cluster.on",
            engineVersion: "7.0",
        },
        sharding: {
            strategy: "hash_slot",
            keyspaceNotifications: "Ex",
            maxMemoryPolicy: "allkeys-lru",
        },
    },
    secondary: {
        host: process.env.REDIS_CLUSTER_SECONDARY_HOST ||
            "reyada-redis-cluster-secondary.xxxxxx.clustercfg.eu-west-1.cache.amazonaws.com",
        port: parseInt(process.env.REDIS_CLUSTER_SECONDARY_PORT || "6379"),
        password: process.env.REDIS_CLUSTER_SECONDARY_PASSWORD || "",
        region: "eu-west-1",
        nodeType: "cache.r6g.large",
        numNodeGroups: 2,
        replicasPerNodeGroup: 1,
        multiAZ: false,
        transitEncryption: true,
        atRestEncryption: true,
        backupRetentionPeriod: 3,
        clusterMode: {
            enabled: true,
            parameterGroupName: "default.redis7.cluster.on",
            engineVersion: "7.0",
        },
    },
    connectionPool: {
        maxConnections: 50,
        minConnections: 10,
        acquireTimeoutMillis: 60000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200,
        propagateCreateError: false,
    },
    failover: {
        enabled: true,
        maxRetries: 3,
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
    },
};
// Apache Ignite Distributed Cache Configuration
export const IGNITE_CONFIG = {
    cluster: {
        name: "reyada-ignite-cluster",
        localHost: process.env.IGNITE_LOCAL_HOST || "127.0.0.1",
        localPort: parseInt(process.env.IGNITE_LOCAL_PORT || "47500"),
        localPortRange: 100,
        addresses: [
            process.env.IGNITE_NODE_1 ||
                "ignite-node-1.reyada-homecare.svc.cluster.local:47500",
            process.env.IGNITE_NODE_2 ||
                "ignite-node-2.reyada-homecare.svc.cluster.local:47500",
            process.env.IGNITE_NODE_3 ||
                "ignite-node-3.reyada-homecare.svc.cluster.local:47500",
        ],
        networkTimeout: 5000,
        socketTimeout: 5000,
        ackTimeout: 5000,
        maxAckTimeout: 600000,
        reconnectCount: 10,
        heartbeatFrequency: 2000,
    },
    dataRegions: {
        default: {
            name: "default",
            initialSize: 268435456,
            maxSize: 1073741824,
            persistenceEnabled: true,
            metricsEnabled: true,
            checkpointPageBufferSize: 268435456,
        },
        patientData: {
            name: "patientDataRegion",
            initialSize: 536870912,
            maxSize: 2147483648,
            persistenceEnabled: true,
            metricsEnabled: true,
            evictionPolicy: "LRU",
            pageEvictionMode: "RANDOM_2_LRU",
        },
        clinicalForms: {
            name: "clinicalFormsRegion",
            initialSize: 268435456,
            maxSize: 1073741824,
            persistenceEnabled: true,
            metricsEnabled: true,
            evictionPolicy: "LRU",
        },
        analytics: {
            name: "analyticsRegion",
            initialSize: 134217728,
            maxSize: 536870912,
            persistenceEnabled: false,
            metricsEnabled: true,
            evictionPolicy: "FIFO",
        },
    },
    cacheConfigurations: {
        patientCache: {
            name: "patientCache",
            cacheMode: "PARTITIONED",
            backups: 2,
            readFromBackup: true,
            atomicityMode: "TRANSACTIONAL",
            writeSynchronizationMode: "FULL_SYNC",
            dataRegionName: "patientDataRegion",
            expiryPolicy: {
                create: 3600000,
                update: 1800000,
                access: 1800000,
            },
        },
        clinicalFormsCache: {
            name: "clinicalFormsCache",
            cacheMode: "PARTITIONED",
            backups: 1,
            readFromBackup: true,
            atomicityMode: "ATOMIC",
            writeSynchronizationMode: "PRIMARY_SYNC",
            dataRegionName: "clinicalFormsRegion",
            expiryPolicy: {
                create: 7200000,
                update: 3600000,
                access: 3600000,
            },
        },
        analyticsCache: {
            name: "analyticsCache",
            cacheMode: "REPLICATED",
            atomicityMode: "ATOMIC",
            writeSynchronizationMode: "FULL_ASYNC",
            dataRegionName: "analyticsRegion",
            expiryPolicy: {
                create: 1800000,
                update: 900000,
                access: 900000,
            },
        },
    },
    persistence: {
        enabled: true,
        storagePath: process.env.IGNITE_STORAGE_PATH || "/opt/ignite/storage",
        walPath: process.env.IGNITE_WAL_PATH || "/opt/ignite/wal",
        walArchivePath: process.env.IGNITE_WAL_ARCHIVE_PATH || "/opt/ignite/wal-archive",
        walMode: "LOG_ONLY",
        walSegmentSize: 67108864,
        walHistorySize: 20,
        walFlushFrequency: 2000,
        checkpointFrequency: 180000,
        checkpointThreads: 4,
        walCompactionEnabled: true,
    },
    ssl: {
        enabled: process.env.IGNITE_SSL_ENABLED === "true",
        keyStoreFilePath: process.env.IGNITE_KEYSTORE_PATH,
        keyStorePassword: process.env.IGNITE_KEYSTORE_PASSWORD,
        trustStoreFilePath: process.env.IGNITE_TRUSTSTORE_PATH,
        trustStorePassword: process.env.IGNITE_TRUSTSTORE_PASSWORD,
    },
};
// Intelligent Cache Management Configuration
export const INTELLIGENT_CACHE_CONFIG = {
    strategies: {
        patientData: {
            strategy: "write_through",
            ttl: 3600,
            maxSize: 10000,
            evictionPolicy: "lru",
            compressionEnabled: true,
            encryptionEnabled: true,
            prefetchEnabled: true,
            prefetchThreshold: 0.8,
            warmupEnabled: true,
            warmupQueries: [
                "recent_patients",
                "active_episodes",
                "pending_assessments",
            ],
        },
        clinicalForms: {
            strategy: "write_behind",
            ttl: 7200,
            maxSize: 5000,
            evictionPolicy: "lfu",
            compressionEnabled: true,
            encryptionEnabled: true,
            batchSize: 100,
            flushFrequency: 30000,
            prefetchEnabled: false,
        },
        analytics: {
            strategy: "cache_aside",
            ttl: 1800,
            maxSize: 1000,
            evictionPolicy: "fifo",
            compressionEnabled: false,
            encryptionEnabled: false,
            refreshAhead: true,
            refreshThreshold: 0.9,
        },
        staticData: {
            strategy: "read_through",
            ttl: 86400,
            maxSize: 2000,
            evictionPolicy: "lru",
            compressionEnabled: true,
            encryptionEnabled: false,
            prefetchEnabled: true,
            warmupEnabled: true,
        },
    },
    performance: {
        monitoring: {
            enabled: true,
            metricsInterval: 60000,
            alertThresholds: {
                hitRatio: 0.8,
                responseTime: 100,
                errorRate: 0.01,
                memoryUsage: 0.85,
            },
        },
        optimization: {
            autoTuning: true,
            adaptiveTTL: true,
            dynamicEviction: true,
            loadBalancing: true,
            circuitBreaker: {
                enabled: true,
                failureThreshold: 5,
                timeout: 60000,
                monitoringPeriod: 10000,
            },
        },
    },
    ml: {
        predictiveAnalytics: {
            enabled: true,
            modelUpdateInterval: 3600000,
            predictionHorizon: 1800000,
            features: [
                "access_patterns",
                "time_of_day",
                "user_behavior",
                "data_freshness",
                "system_load",
            ],
        },
        anomalyDetection: {
            enabled: true,
            algorithm: "isolation_forest",
            threshold: 0.1,
            windowSize: 1000,
            alerting: true,
        },
    },
};
// CDN Integration Configuration
export const CDN_CONFIG = {
    cloudfront: {
        distributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID || "E1234567890ABC",
        domainName: process.env.CLOUDFRONT_DOMAIN || "cdn.reyada.ae",
        origins: [
            {
                id: "api-origin",
                domainName: process.env.API_DOMAIN || "api.reyada.ae",
                originPath: "/api",
                customOriginConfig: {
                    httpPort: 80,
                    httpsPort: 443,
                    originProtocolPolicy: "https-only",
                    originSslProtocols: ["TLSv1.2"],
                },
            },
            {
                id: "static-origin",
                domainName: process.env.STATIC_DOMAIN || "static.reyada.ae",
                originPath: "/static",
                s3OriginConfig: {
                    originAccessIdentity: process.env.OAI_ID ||
                        "origin-access-identity/cloudfront/E1234567890ABC",
                },
            },
        ],
        cacheBehaviors: [
            {
                pathPattern: "/api/static/*",
                targetOriginId: "static-origin",
                viewerProtocolPolicy: "redirect-to-https",
                cachePolicyId: "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
                compress: true,
                ttl: {
                    default: 86400,
                    max: 31536000,
                    min: 0,
                },
            },
            {
                pathPattern: "/api/dynamic/*",
                targetOriginId: "api-origin",
                viewerProtocolPolicy: "redirect-to-https",
                cachePolicyId: "b2884449-e4de-46a7-ac36-70bc7f1ddd6d",
                compress: true,
                ttl: {
                    default: 0,
                    max: 0,
                    min: 0,
                },
            },
        ],
        geoRestriction: {
            restrictionType: "whitelist",
            locations: ["AE", "SA", "QA", "KW", "BH", "OM"],
        },
        webAclId: process.env.WAF_WEB_ACL_ID,
        priceClass: "PriceClass_100",
        httpVersion: "http2",
    },
    edgeLocations: {
        primary: "Middle East (UAE)",
        secondary: ["Europe (Ireland)", "Asia Pacific (Mumbai)"],
        customHeaders: {
            "X-Cache-Region": "${aws:cloudfront-pop}",
            "X-Cache-Status": "${cloudfront:cache-status}",
            "X-Request-ID": "${request:id}",
        },
    },
    invalidation: {
        enabled: true,
        patterns: ["/api/patients/*", "/api/clinical-forms/*", "/api/analytics/*"],
        maxInvalidations: 1000,
        batchSize: 100,
    },
};
// Cache Performance Analytics Configuration
export const CACHE_ANALYTICS_CONFIG = {
    metrics: {
        collection: {
            enabled: true,
            interval: 30000,
            retention: 2592000000,
            aggregation: {
                levels: ["1m", "5m", "1h", "1d"],
                functions: ["avg", "max", "min", "sum", "count"],
            },
        },
        kpis: [
            {
                name: "hit_ratio",
                description: "Cache hit ratio percentage",
                target: 85,
                critical: 70,
                unit: "percentage",
            },
            {
                name: "response_time",
                description: "Average cache response time",
                target: 50,
                critical: 200,
                unit: "milliseconds",
            },
            {
                name: "throughput",
                description: "Cache operations per second",
                target: 1000,
                critical: 100,
                unit: "ops/sec",
            },
            {
                name: "memory_usage",
                description: "Cache memory utilization",
                target: 80,
                critical: 95,
                unit: "percentage",
            },
            {
                name: "error_rate",
                description: "Cache error rate",
                target: 0.1,
                critical: 1.0,
                unit: "percentage",
            },
        ],
        dashboards: {
            realTime: {
                enabled: true,
                refreshInterval: 5000,
                widgets: [
                    "hit_ratio_gauge",
                    "response_time_chart",
                    "throughput_chart",
                    "memory_usage_gauge",
                    "error_rate_chart",
                ],
            },
            historical: {
                enabled: true,
                timeRanges: ["1h", "6h", "24h", "7d", "30d"],
                widgets: [
                    "performance_trends",
                    "usage_patterns",
                    "capacity_planning",
                    "cost_analysis",
                ],
            },
        },
    },
    alerting: {
        enabled: true,
        channels: [
            {
                type: "email",
                recipients: ["ops@reyada.ae", "dev@reyada.ae"],
                severity: ["critical", "high"],
            },
            {
                type: "slack",
                webhook: process.env.SLACK_WEBHOOK_URL,
                channel: "#alerts",
                severity: ["critical", "high", "medium"],
            },
            {
                type: "pagerduty",
                integrationKey: process.env.PAGERDUTY_INTEGRATION_KEY,
                severity: ["critical"],
            },
        ],
        rules: [
            {
                name: "Low Hit Ratio",
                condition: "hit_ratio < 70",
                severity: "high",
                duration: 300000,
                actions: ["alert", "auto_scale"],
            },
            {
                name: "High Response Time",
                condition: "response_time > 200",
                severity: "medium",
                duration: 180000,
                actions: ["alert"],
            },
            {
                name: "Memory Usage Critical",
                condition: "memory_usage > 95",
                severity: "critical",
                duration: 60000,
                actions: ["alert", "emergency_eviction"],
            },
        ],
    },
    reporting: {
        enabled: true,
        schedule: {
            daily: "0 8 * * *",
            weekly: "0 8 * * 1",
            monthly: "0 8 1 * *",
        },
        recipients: ["management@reyada.ae", "ops@reyada.ae"],
        format: "pdf",
        includeRecommendations: true,
    },
};
// Predictive Cache Warming Configuration
export const PREDICTIVE_WARMING_CONFIG = {
    ml: {
        models: {
            accessPrediction: {
                algorithm: "lstm",
                features: [
                    "historical_access_patterns",
                    "time_of_day",
                    "day_of_week",
                    "user_behavior",
                    "seasonal_patterns",
                    "system_events",
                ],
                trainingData: {
                    windowSize: 30,
                    minSamples: 1000,
                    updateFrequency: "daily",
                },
                accuracy: {
                    target: 0.85,
                    minimum: 0.7,
                },
            },
            demandForecasting: {
                algorithm: "arima",
                features: [
                    "request_volume",
                    "response_time",
                    "cache_misses",
                    "system_load",
                ],
                horizon: 3600000,
                confidence: 0.95,
            },
        },
        training: {
            schedule: "0 2 * * *",
            autoRetraining: true,
            performanceThreshold: 0.75,
            dataRetention: 90,
        },
    },
    warming: {
        strategies: {
            proactive: {
                enabled: true,
                leadTime: 300000,
                confidence: 0.8,
                maxConcurrency: 10,
                priority: "high",
            },
            reactive: {
                enabled: true,
                threshold: 0.9,
                batchSize: 50,
                priority: "medium",
            },
            scheduled: {
                enabled: true,
                schedules: [
                    {
                        name: "morning_warmup",
                        cron: "0 7 * * *",
                        datasets: ["active_patients", "daily_schedules"],
                        priority: "high",
                    },
                    {
                        name: "evening_warmup",
                        cron: "0 17 * * *",
                        datasets: ["shift_handover", "daily_reports"],
                        priority: "medium",
                    },
                ],
            },
        },
        execution: {
            maxConcurrency: 20,
            timeout: 30000,
            retryAttempts: 3,
            backoffMultiplier: 2,
            circuitBreaker: {
                enabled: true,
                failureThreshold: 5,
                timeout: 60000,
            },
        },
        monitoring: {
            enabled: true,
            metrics: [
                "warming_success_rate",
                "warming_duration",
                "prediction_accuracy",
                "cache_hit_improvement",
            ],
            alerting: {
                enabled: true,
                thresholds: {
                    success_rate: 0.9,
                    prediction_accuracy: 0.8,
                },
            },
        },
    },
    optimization: {
        adaptive: {
            enabled: true,
            learningRate: 0.01,
            adjustmentInterval: 3600000,
            parameters: [
                "warming_frequency",
                "batch_size",
                "lead_time",
                "confidence_threshold",
            ],
        },
        costOptimization: {
            enabled: true,
            budgetLimit: 1000,
            costPerOperation: 0.001,
            roi: {
                target: 3.0,
                minimum: 1.5,
            },
        },
    },
};
// Cache Layers Configuration
export const CACHE_LAYERS_CONFIG = {
    l1: {
        type: "memory",
        provider: "node-cache",
        maxSize: 100,
        ttl: 300,
        checkPeriod: 60,
        useClones: false,
        deleteOnExpire: true,
    },
    l2: {
        type: "redis",
        provider: "redis-cluster",
        maxSize: 1000,
        ttl: 3600,
        compression: true,
        serialization: "json",
    },
    l3: {
        type: "distributed",
        provider: "apache-ignite",
        maxSize: 10000,
        ttl: 86400,
        persistence: true,
        replication: 2,
    },
    coordination: {
        strategy: "write_through_all",
        readStrategy: "fastest_response",
        consistency: "eventual",
        invalidation: "cascade",
    },
};
export default {
    REDIS_CLUSTER_CONFIG,
    IGNITE_CONFIG,
    INTELLIGENT_CACHE_CONFIG,
    CDN_CONFIG,
    CACHE_ANALYTICS_CONFIG,
    PREDICTIVE_WARMING_CONFIG,
    CACHE_LAYERS_CONFIG,
};
