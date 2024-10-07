# Cloudwatch log group for Redis slow logs
resource "aws_cloudwatch_log_group" "redis_slow_log" {
    name = "${local.resource_prefix}/redis-slow-log"
    retention_in_days = 30
}

# Cloudwatch log group for Redis engine logs
resource "aws_cloudwatch_log_group" "redis_engine_log" {
    name = "${local.resource_prefix}/redis-engine-log"
    retention_in_days = 30
}

# Subnet Group for Redis instances
resource "aws_elasticache_subnet_group" "cache" {
    name        = local.resource_prefix
    description = "Subnet Group for Redis"
    subnet_ids  = var.private_subnet_ids
}

# Redis users
resource "random_password" "cache_password" {
  length  = 24
  special = false
}

resource "aws_elasticache_user" "cache" {
  user_id       = "${var.project}-${var.environment}"
  user_name     = "default"
  access_string = "on ~* +@all"
  engine        = "REDIS"
  passwords     = [random_password.cache_password.result]
}

# User Group for Redis Access Control List
resource "aws_elasticache_user_group" "cache" {
    engine = "REDIS"
    user_group_id = local.resource_prefix
    user_ids = [aws_elasticache_user.cache.user_id]
}

# Elasticache Replication Group for Redis
resource "aws_elasticache_replication_group" "redis" {
    apply_immediately = true
    at_rest_encryption_enabled = true
    auto_minor_version_upgrade = true
    automatic_failover_enabled = true
    description = "Redis Cluster"
    engine = "redis"
    engine_version = "6.2"
    maintenance_window = "sun:05:00-sun:09:00"
    multi_az_enabled = true
    node_type = var.node_type
    num_cache_clusters = 2
    parameter_group_name = "default.redis6.x"
    port = 6379
    replication_group_id = local.resource_prefix
    security_group_ids = [aws_security_group.cache_sg.id]
    snapshot_retention_limit = 0 # disabled
    subnet_group_name = aws_elasticache_subnet_group.cache.name
    transit_encryption_enabled = true
    user_group_ids = [aws_elasticache_user_group.cache.id]

    log_delivery_configuration {
        destination = aws_cloudwatch_log_group.redis_slow_log.name
        destination_type = "cloudwatch-logs"
        log_format = "json"
        log_type = "slow-log"
    }

    log_delivery_configuration {
        destination = aws_cloudwatch_log_group.redis_engine_log.name
        destination_type = "cloudwatch-logs"
        log_format = "json"
        log_type = "engine-log"
    }
}
