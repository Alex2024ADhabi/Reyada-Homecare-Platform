provider "aws" {
  region = var.primary_region
}

provider "aws" {
  alias  = "secondary"
  region = var.secondary_region
}

# VPC for Primary Region
module "vpc_primary" {
  source = "terraform-aws-modules/vpc/aws"
  version = "~> 3.0"

  name = "reyada-vpc-primary"
  cidr = "10.0.0.0/16"

  azs             = ["${var.primary_region}a", "${var.primary_region}b", "${var.primary_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = false
  one_nat_gateway_per_az = true

  enable_vpn_gateway = false

  tags = {
    Environment = "production"
    Project     = "reyada-homecare"
  }
}

# VPC for Secondary Region
module "vpc_secondary" {
  source = "terraform-aws-modules/vpc/aws"
  version = "~> 3.0"
  providers = {
    aws = aws.secondary
  }

  name = "reyada-vpc-secondary"
  cidr = "10.1.0.0/16"

  azs             = ["${var.secondary_region}a", "${var.secondary_region}b", "${var.secondary_region}c"]
  private_subnets = ["10.1.1.0/24", "10.1.2.0/24", "10.1.3.0/24"]
  public_subnets  = ["10.1.101.0/24", "10.1.102.0/24", "10.1.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = false
  one_nat_gateway_per_az = true

  enable_vpn_gateway = false

  tags = {
    Environment = "production"
    Project     = "reyada-homecare"
  }
}

# VPC Peering between regions
resource "aws_vpc_peering_connection" "primary_to_secondary" {
  vpc_id      = module.vpc_primary.vpc_id
  peer_vpc_id = module.vpc_secondary.vpc_id
  peer_region = var.secondary_region
  auto_accept = false

  tags = {
    Name = "reyada-vpc-peering"
    Environment = "production"
    Project     = "reyada-homecare"
  }
}

resource "aws_vpc_peering_connection_accepter" "secondary_accepter" {
  provider                  = aws.secondary
  vpc_peering_connection_id = aws_vpc_peering_connection.primary_to_secondary.id
  auto_accept               = true

  tags = {
    Name = "reyada-vpc-peering-accepter"
    Environment = "production"
    Project     = "reyada-homecare"
  }
}

# EKS Cluster in Primary Region
module "eks_primary" {
  source = "terraform-aws-modules/eks/aws"
  version = "~> 18.0"

  cluster_name    = "reyada-homecare-cluster"
  cluster_version = "1.24"

  vpc_id     = module.vpc_primary.vpc_id
  subnet_ids = module.vpc_primary.private_subnets

  cluster_endpoint_private_access = true
  cluster_endpoint_public_access  = true

  eks_managed_node_groups = {
    general = {
      desired_size = 6
      min_size     = 4
      max_size     = 20

      instance_types = ["t3.xlarge"]
      capacity_type  = "ON_DEMAND"
    }

    compute = {
      desired_size = 4
      min_size     = 2
      max_size     = 15

      instance_types = ["c5.2xlarge"]
      capacity_type  = "ON_DEMAND"

      labels = {
        workload = "compute"
      }

      taints = [
        {
          key    = "dedicated"
          value  = "compute"
          effect = "NO_SCHEDULE"
        }
      ]
    }

    memory_optimized = {
      desired_size = 2
      min_size     = 1
      max_size     = 8

      instance_types = ["r5.xlarge"]
      capacity_type  = "ON_DEMAND"

      labels = {
        workload = "memory-intensive"
      }
    }
  }

  tags = {
    Environment = "production"
    Project     = "reyada-homecare"
  }
}

# EKS Cluster in Secondary Region
module "eks_secondary" {
  source = "terraform-aws-modules/eks/aws"
  version = "~> 18.0"
  providers = {
    aws = aws.secondary
  }

  cluster_name    = "reyada-homecare-cluster-dr"
  cluster_version = "1.24"

  vpc_id     = module.vpc_secondary.vpc_id
  subnet_ids = module.vpc_secondary.private_subnets

  cluster_endpoint_private_access = true
  cluster_endpoint_public_access  = true

  eks_managed_node_groups = {
    general = {
      desired_size = 4
      min_size     = 2
      max_size     = 12

      instance_types = ["t3.xlarge"]
      capacity_type  = "ON_DEMAND"
    }
  }

  tags = {
    Environment = "production"
    Project     = "reyada-homecare"
  }
}

# RDS PostgreSQL in Primary Region
module "rds_primary" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 5.0"

  identifier = "reyada-postgres-primary"

  engine               = "postgres"
  engine_version       = "14"
  family               = "postgres14"
  major_engine_version = "14"
  instance_class       = "db.r5.2xlarge"

  allocated_storage     = 500
  max_allocated_storage = 2000

  db_name  = "reyada"
  username = var.db_username
  password = var.db_password
  port     = 5432

  multi_az               = true
  db_subnet_group_name   = aws_db_subnet_group.primary.name
  vpc_security_group_ids = [aws_security_group.rds_primary.id]

  maintenance_window              = "Mon:00:00-Mon:03:00"
  backup_window                   = "03:00-06:00"
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  backup_retention_period = 7
  skip_final_snapshot     = false
  deletion_protection     = true

  performance_insights_enabled          = true
  performance_insights_retention_period = 7
  create_monitoring_role                = true
  monitoring_interval                   = 60

  parameters = [
    {
      name  = "autovacuum"
      value = 1
    },
    {
      name  = "client_encoding"
      value = "utf8"
    }
  ]

  tags = {
    Environment = "production"
    Project     = "reyada-homecare"
  }
}

resource "aws_db_subnet_group" "primary" {
  name       = "reyada-db-subnet-group-primary"
  subnet_ids = module.vpc_primary.private_subnets

  tags = {
    Environment = "production"
    Project     = "reyada-homecare"
  }
}

resource "aws_security_group" "rds_primary" {
  name        = "reyada-rds-sg-primary"
  description = "Allow PostgreSQL inbound traffic"
  vpc_id      = module.vpc_primary.vpc_id

  ingress {
    description     = "PostgreSQL from VPC"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    cidr_blocks     = [module.vpc_primary.vpc_cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Environment = "production"
    Project     = "reyada-homecare"
  }
}

# RDS PostgreSQL in Secondary Region (Read Replica)
module "rds_secondary" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 5.0"
  providers = {
    aws = aws.secondary
  }

  identifier = "reyada-postgres-secondary"

  # For a read replica, we need to specify the source DB instance
  replicate_source_db = module.rds_primary.db_instance_id

  engine               = "postgres"
  engine_version       = "14"
  family               = "postgres14"
  major_engine_version = "14"
  instance_class       = "db.r5.large"

  allocated_storage     = 100
  max_allocated_storage = 500

  # No need to specify username/password for a read replica
  port = 5432

  multi_az               = false
  db_subnet_group_name   = aws_db_subnet_group.secondary.name
  vpc_security_group_ids = [aws_security_group.rds_secondary.id]

  maintenance_window              = "Tue:00:00-Tue:03:00"
  backup_window                   = "03:00-06:00"
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  backup_retention_period = 7
  skip_final_snapshot     = false
  deletion_protection     = true

  performance_insights_enabled          = true
  performance_insights_retention_period = 7
  create_monitoring_role                = true
  monitoring_interval                   = 60

  tags = {
    Environment = "production"
    Project     = "reyada-homecare"
  }
}

resource "aws_db_subnet_group" "secondary" {
  provider   = aws.secondary
  name       = "reyada-db-subnet-group-secondary"
  subnet_ids = module.vpc_secondary.private_subnets

  tags = {
    Environment = "production"
    Project     = "reyada-homecare"
  }
}

resource "aws_security_group" "rds_secondary" {
  provider    = aws.secondary
  name        = "reyada-rds-sg-secondary"
  description = "Allow PostgreSQL inbound traffic"
  vpc_id      = module.vpc_secondary.vpc_id

  ingress {
    description     = "PostgreSQL from VPC"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    cidr_blocks     = [module.vpc_secondary.vpc_cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Environment = "production"
    Project     = "reyada-homecare"
  }
}

# ElastiCache Redis in Primary Region
resource "aws_elasticache_subnet_group" "primary" {
  name       = "reyada-redis-subnet-group-primary"
  subnet_ids = module.vpc_primary.private_subnets
}

resource "aws_elasticache_replication_group" "primary" {
  replication_group_id          = "reyada-redis-primary"
  replication_group_description = "Reyada Homecare Redis Cluster"
  node_type                     = "cache.m5.xlarge"
  port                          = 6379
  parameter_group_name          = "default.redis6.x.cluster.on"
  automatic_failover_enabled    = true
  engine_version                = "6.x"
  subnet_group_name             = aws_elasticache_subnet_group.primary.name
  security_group_ids            = [aws_security_group.redis_primary.id]
  num_node_groups               = 4
  replicas_per_node_group       = 2

  tags = {
    Environment = "production"
    Project     = "reyada-homecare"
  }
}

resource "aws_security_group" "redis_primary" {
  name        = "reyada-redis-sg-primary"
  description = "Allow Redis inbound traffic"
  vpc_id      = module.vpc_primary.vpc_id

  ingress {
    description     = "Redis from VPC"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    cidr_blocks     = [module.vpc_primary.vpc_cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Environment = "production"
    Project     = "reyada-homecare"
  }
}

# ElastiCache Redis in Secondary Region
resource "aws_elasticache_subnet_group" "secondary" {
  provider   = aws.secondary
  name       = "reyada-redis-subnet-group-secondary"
  subnet_ids = module.vpc_secondary.private_subnets
}

resource "aws_elasticache_replication_group" "secondary" {
  provider                       = aws.secondary
  replication_group_id          = "reyada-redis-secondary"
  replication_group_description = "Reyada Homecare Redis Cluster (DR)"
  node_type                     = "cache.m5.xlarge"
  port                          = 6379
  parameter_group_name          = "default.redis6.x.cluster.on"
  automatic_failover_enabled    = true
  engine_version                = "6.x"
  subnet_group_name             = aws_elasticache_subnet_group.secondary.name
  security_group_ids            = [aws_security_group.redis_secondary.id]
  num_node_groups               = 4
  replicas_per_node_group       = 2

  tags = {
    Environment = "production"
    Project     = "reyada-homecare"
  }
}

resource "aws_security_group" "redis_secondary" {
  provider    = aws.secondary
  name        = "reyada-redis-sg-secondary"
  description = "Allow Redis inbound traffic"
  vpc_id      = module.vpc_secondary.vpc_id

  ingress {
    description     = "Redis from VPC"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    cidr_blocks     = [module.vpc_secondary.vpc_cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Environment = "production"
    Project     = "reyada-homecare"
  }
}

# S3 Buckets for Storage
resource "aws_s3_bucket" "documents" {
  bucket = "reyada-homecare-documents"

  tags = {
    Environment = "production"
    Project     = "reyada-homecare"
  }
}

resource "aws_s3_bucket_versioning" "documents_versioning" {
  bucket = aws_s3_bucket.documents.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "documents_encryption" {
  bucket = aws_s3_bucket.documents.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket" "backups" {
  bucket = "reyada-homecare-backups"

  tags = {
    Environment = "production"
    Project     = "reyada-homecare"
  }
}

resource "aws_s3_bucket_versioning" "backups_versioning" {
  bucket = aws_s3_bucket.backups.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "backups_encryption" {
  bucket = aws_s3_bucket.backups.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# CloudFront Distribution for Frontend
resource "aws_cloudfront_distribution" "frontend" {
  origin {
    domain_name = "reyada-homecare.ae"
    origin_id   = "reyada-frontend"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Reyada Homecare Frontend Distribution"
  default_root_object = "index.html"

  aliases = ["reyada-homecare.ae", "www.reyada-homecare.ae"]

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "reyada-frontend"

    forwarded_values {
      query_string = true
      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  price_class = "PriceClass_200"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = var.acm_certificate_arn
    ssl_support_method  = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Environment = "production"
    Project     = "reyada-homecare"
  }
}

# Route53 Records
resource "aws_route53_zone" "primary" {
  name = "reyada-homecare.ae"

  tags = {
    Environment = "production"
    Project     = "reyada-homecare"
  }
}

resource "aws_route53_record" "frontend" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = "reyada-homecare.ae"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = "www.reyada-homecare.ae"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = "api.reyada-homecare.ae"
  type    = "A"

  alias {
    name                   = module.eks_primary.cluster_endpoint
    zone_id                = module.eks_primary.cluster_primary_security_group_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "ws" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = "ws.reyada-homecare.ae"
  type    = "A"

  alias {
    name                   = module.eks_primary.cluster_endpoint
    zone_id                = module.eks_primary.cluster_primary_security_group_id
    evaluate_target_health = true
  }
}

# Variables
variable "primary_region" {
  description = "The primary AWS region"
  default     = "me-south-1"
}

variable "secondary_region" {
  description = "The secondary AWS region for disaster recovery"
  default     = "eu-west-1"
}

variable "db_username" {
  description = "Database administrator username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database administrator password"
  type        = string
  sensitive   = true
}

variable "acm_certificate_arn" {
  description = "ARN of the ACM certificate for CloudFront"
  type        = string
}

# Outputs
output "vpc_primary_id" {
  description = "ID of the primary VPC"
  value       = module.vpc_primary.vpc_id
}

output "vpc_secondary_id" {
  description = "ID of the secondary VPC"
  value       = module.vpc_secondary.vpc_id
}

output "eks_primary_endpoint" {
  description = "Endpoint for primary EKS control plane"
  value       = module.eks_primary.cluster_endpoint
}

output "eks_secondary_endpoint" {
  description = "Endpoint for secondary EKS control plane"
  value       = module.eks_secondary.cluster_endpoint
}

output "rds_primary_endpoint" {
  description = "The connection endpoint for the primary RDS instance"
  value       = module.rds_primary.db_instance_endpoint
}

output "rds_secondary_endpoint" {
  description = "The connection endpoint for the secondary RDS instance"
  value       = module.rds_secondary.db_instance_endpoint
}

output "redis_primary_endpoint" {
  description = "The connection endpoint for the primary Redis cluster"
  value       = aws_elasticache_replication_group.primary.configuration_endpoint_address
}

output "redis_secondary_endpoint" {
  description = "The connection endpoint for the secondary Redis cluster"
  value       = aws_elasticache_replication_group.secondary.configuration_endpoint_address
}

output "cloudfront_domain_name" {
  description = "The domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.frontend.domain_name
}
