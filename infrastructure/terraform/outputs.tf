output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "public_subnets" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnets
}

output "private_subnets" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnets
}

output "uploads_bucket_name" {
  description = "S3 bucket name for uploads"
  value       = aws_s3_bucket.uploads.bucket
}

output "outputs_bucket_name" {
  description = "S3 bucket name for outputs"
  value       = aws_s3_bucket.outputs.bucket
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.postgres.endpoint
}

output "rds_database_name" {
  description = "RDS database name"
  value       = aws_db_instance.postgres.db_name
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
}

output "api_instance_id" {
  description = "EC2 instance ID for API server"
  value       = aws_instance.api.id
}

output "api_public_ip" {
  description = "Elastic IP for API server"
  value       = aws_eip.api.public_ip
}

output "api_security_group_id" {
  description = "Security group ID for API server"
  value       = aws_security_group.api.id
}
