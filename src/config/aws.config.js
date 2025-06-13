// AWS Configuration for Multi-region setup
// Remove dotenv import as it's not needed in browser environment
// import { config } from "dotenv";
// Environment variables are now provided by Vite's define option
// AWS Region Configuration
export const AWS_REGIONS = {
    PRIMARY: "me-south-1", // Dubai
    SECONDARY: "eu-west-1", // Ireland
};
// AWS Service Configuration
export const AWS_CONFIG = {
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
    region: AWS_REGIONS.PRIMARY,
};
// CloudFront CDN Configuration
export const CLOUDFRONT_CONFIG = {
    distributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID || "",
    domain: process.env.CLOUDFRONT_DOMAIN || "reyada-homecare.ae",
    originDomain: process.env.CLOUDFRONT_ORIGIN_DOMAIN || "reyada-homecare.ae",
    certificateArn: process.env.ACM_CERTIFICATE_ARN || "",
    priceClass: "PriceClass_200", // Covers Europe, Middle East, and Africa
    ttl: {
        min: 0,
        default: 3600, // 1 hour
        max: 86400, // 24 hours
    },
};
// VPC Configuration
export const VPC_CONFIG = {
    primary: {
        vpcId: process.env.PRIMARY_VPC_ID || "",
        cidr: "10.0.0.0/16",
        subnetIds: process.env.PRIMARY_SUBNET_IDS?.split(",") || [],
        securityGroupIds: process.env.PRIMARY_SECURITY_GROUP_IDS?.split(",") || [],
        availabilityZones: ["me-south-1a", "me-south-1b", "me-south-1c"],
    },
    secondary: {
        vpcId: process.env.SECONDARY_VPC_ID || "",
        cidr: "10.1.0.0/16",
        subnetIds: process.env.SECONDARY_SUBNET_IDS?.split(",") || [],
        securityGroupIds: process.env.SECONDARY_SECURITY_GROUP_IDS?.split(",") || [],
        availabilityZones: ["eu-west-1a", "eu-west-1b", "eu-west-1c"],
    },
    peering: {
        id: process.env.VPC_PEERING_CONNECTION_ID || "",
        status: process.env.VPC_PEERING_STATUS || "active",
    },
};
// Load Balancer Configuration
export const LOAD_BALANCER_CONFIG = {
    primary: {
        arn: process.env.PRIMARY_LOAD_BALANCER_ARN || "",
        dnsName: process.env.PRIMARY_LOAD_BALANCER_DNS || "",
        type: "application", // ALB
        scheme: "internet-facing",
        securityGroups: process.env.PRIMARY_LB_SECURITY_GROUPS?.split(",") || [],
        listeners: {
            http: {
                port: 80,
                protocol: "HTTP",
                action: "redirect-to-https",
            },
            https: {
                port: 443,
                protocol: "HTTPS",
                certificateArn: process.env.PRIMARY_LB_CERTIFICATE_ARN || "",
            },
        },
    },
    secondary: {
        arn: process.env.SECONDARY_LOAD_BALANCER_ARN || "",
        dnsName: process.env.SECONDARY_LOAD_BALANCER_DNS || "",
        type: "application", // ALB
        scheme: "internet-facing",
        securityGroups: process.env.SECONDARY_LB_SECURITY_GROUPS?.split(",") || [],
        listeners: {
            http: {
                port: 80,
                protocol: "HTTP",
                action: "redirect-to-https",
            },
            https: {
                port: 443,
                protocol: "HTTPS",
                certificateArn: process.env.SECONDARY_LB_CERTIFICATE_ARN || "",
            },
        },
    },
    routePolicy: "weighted", // Options: weighted, latency, failover
};
// EKS Configuration
export const EKS_CONFIG = {
    primary: {
        clusterName: "reyada-homecare-cluster",
        version: "1.24",
        endpoint: process.env.PRIMARY_EKS_ENDPOINT || "",
        nodeGroups: {
            general: {
                instanceType: "t3.large",
                minSize: 2,
                maxSize: 10,
                desiredSize: 2,
            },
            compute: {
                instanceType: "c5.xlarge",
                minSize: 1,
                maxSize: 5,
                desiredSize: 1,
            },
        },
    },
    secondary: {
        clusterName: "reyada-homecare-cluster-dr",
        version: "1.24",
        endpoint: process.env.SECONDARY_EKS_ENDPOINT || "",
        nodeGroups: {
            general: {
                instanceType: "t3.large",
                minSize: 2,
                maxSize: 10,
                desiredSize: 2,
            },
        },
    },
};
// S3 Configuration
export const S3_CONFIG = {
    documents: {
        bucketName: "reyada-homecare-documents",
        region: AWS_REGIONS.PRIMARY,
        versioning: true,
        encryption: "AES256",
    },
    backups: {
        bucketName: "reyada-homecare-backups",
        region: AWS_REGIONS.PRIMARY,
        versioning: true,
        encryption: "AES256",
        lifecycleRules: [
            {
                id: "archive-after-30-days",
                status: "Enabled",
                transition: {
                    days: 30,
                    storageClass: "STANDARD_IA",
                },
            },
            {
                id: "delete-after-365-days",
                status: "Enabled",
                expiration: {
                    days: 365,
                },
            },
        ],
    },
};
// Route53 Configuration
export const ROUTE53_CONFIG = {
    zoneName: "reyada-homecare.ae",
    zoneId: process.env.ROUTE53_ZONE_ID || "",
    records: {
        apex: {
            type: "A",
            alias: true,
            target: "cloudfront",
        },
        www: {
            type: "A",
            alias: true,
            target: "cloudfront",
        },
        api: {
            type: "A",
            alias: true,
            target: "primary-alb",
        },
        ws: {
            type: "A",
            alias: true,
            target: "primary-alb",
        },
    },
    healthChecks: {
        api: {
            path: "/health",
            port: 443,
            type: "HTTPS",
            resourcePath: "/health",
            failureThreshold: 3,
            requestInterval: 30,
        },
    },
    failover: {
        enabled: true,
        primary: AWS_REGIONS.PRIMARY,
        secondary: AWS_REGIONS.SECONDARY,
    },
};
