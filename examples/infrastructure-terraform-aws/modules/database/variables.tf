variable "project" {
  description = "The project name"
  type = string
  default = "project"
}

variable "environment" {
  description = "The environment name - staging, production"
  type = string
}

variable "vpc_id" {
  description = "The id for the containing vpc"
  type = string
}

variable "private_subnet_ids" {
  description = "Private subnet ids"
  type = list(string)
}

variable "domain_name" {
  description = "The domain name to use for creating dns entries. Eg. example.com"
  type = string
}

variable "db_name" {
  description = "The db name. Eg. db"
  type = string
}

variable "allowed_security_groups" {
  description = "Named security group allowed to communicate with the db"
  type = list(object({
    name = string
    security_group_id = string
  }))
}

variable "db" {
  type = object({
    backup_retention_period               = optional(number, 1) # number of days
    cloudwatch_log_export                 = optional(string, "postgresql")
    count                                 = optional(number, 1)
    enabled                               = optional(bool, false)
    engine                                = optional(string, "aurora-postgresql")
    engine_mode                           = optional(string, "provisioned")
    engine_version                        = optional(string, "14.9")
    instance_class                        = optional(string, "db.serverless")
    max_capacity                          = optional(number, 1.0)                   # maximum acu
    min_capacity                          = optional(number, 0.5)                   # minimum acu
    monitoring_interval                   = optional(number, 0)                     # number of seconds between capturing enhanced monitoring (0 = off, 1, 5, 15, 30, 60)
    performance_insights_enabled          = optional(bool, false)                   # enable/disable performance insights
    performance_insights_retention_period = optional(number, 7)                     # retention period if performance insights enabled, free tier is 7 (unit is days)
    preferred_backup_window               = optional(string, "04:00-04:30")         # 30 min daily window
    preferred_maintenance_window          = optional(string, "sun:06:00-sun:06:30") # 30 min weekly window
    publicly_accessible                   = optional(bool, false)
  })
}
