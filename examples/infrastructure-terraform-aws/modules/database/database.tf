resource "aws_db_subnet_group" "db_subnet_group" {
  name        = "${local.resource_prefix}-private"
  description = "Subnet Group for Aurora Clusters"
  subnet_ids  = var.private_subnet_ids
}

resource "random_password" "db_password" {
  length  = 24
  special = false
}

resource "aws_rds_cluster" "db_cluster" {

  allow_major_version_upgrade         = true
  apply_immediately                   = true
  backup_retention_period             = var.db.backup_retention_period
  cluster_identifier                  = local.resource_prefix
  copy_tags_to_snapshot               = true
  db_subnet_group_name                = aws_db_subnet_group.db_subnet_group.name
  enabled_cloudwatch_logs_exports     = [var.db.cloudwatch_log_export]
  engine                              = var.db.engine
  engine_mode                         = var.db.engine_mode
  engine_version                      = var.db.engine_version
  final_snapshot_identifier           = "${local.resource_prefix}-final-snapshot"
  iam_database_authentication_enabled = false
  master_username                     = "root"
  master_password                     = random_password.db_password.result
  preferred_backup_window             = var.db.preferred_backup_window
  preferred_maintenance_window        = var.db.preferred_maintenance_window
  skip_final_snapshot                 = false
  storage_encrypted                   = true
  vpc_security_group_ids              = [aws_security_group.database_sg.id]

  serverlessv2_scaling_configuration {
    max_capacity = var.db.max_capacity
    min_capacity = var.db.min_capacity
  }

}

resource "aws_rds_cluster_instance" "db_instance" {

  cluster_identifier                    = aws_rds_cluster.db_cluster.id
  engine                                = aws_rds_cluster.db_cluster.engine
  engine_version                        = aws_rds_cluster.db_cluster.engine_version
  identifier                            = local.resource_prefix
  instance_class                        = var.db.instance_class
  monitoring_interval                   = var.db.monitoring_interval
  performance_insights_enabled          = var.db.performance_insights_enabled
  performance_insights_retention_period = var.db.performance_insights_enabled ? var.db.performance_insights_retention_period : null
  preferred_maintenance_window          = var.db.preferred_maintenance_window
  publicly_accessible                   = var.db.publicly_accessible

}
