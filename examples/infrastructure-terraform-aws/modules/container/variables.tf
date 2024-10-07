variable "project" {
  description = "The project name"
  type = string
  default = "project"
}

variable "environment" {
  description = "The environment name - staging, production"
  type = string
}

variable "region" {
  description = "The aws region"
  type = string
}

variable "vpc_id" {
  description = "The id for the containing vpc"
  type = string
}

variable "ssl_cert_arn" {
  description = "The arn of the ssl cert"
  type = string
}

variable "container_name" {
  description = "The container name. Eg. server"
  type = string
}

variable "private_subnet_ids" {
  description = "Private subnet ids"
  type = list(string)
}

variable "public_subnet_ids" {
  description = "Private subnet ids"
  type = list(string)
}

variable "ecs_cluster_id" {
  description = "Id of the ecs cluster to create the container in"
  type = string
}

variable "domain_name" {
  description = "The domain name to use for creating dns entries. Eg. example.com"
  type = string
}

variable "task_cpu" {
  description = "Number of cpu units used by the task"
  type = number
}

variable "task_memory" {
  description = "Amount (in MiB) of memory used by the task"
  type = number
}

variable "task_rights" {
  description = "An array of maps that are the contents of a policy document statement"
  type        = list(map(any))
  default = []
}

variable "task_environment_variables" {
  description = "Task environment variables"
  default = []
  type = list(object({
    name = string
    value = string
  }))
}

variable "task_secrets" {
  description = "Secret manager secrets with value in the form of SECRET_ID:SECRET_NAME::"
  default = []
  type = list(object({
    name = string
    valueFrom = string
  }))
}

variable "image" {
  description = "The image for the container. If null creates and pulls from ecr"
  type = string
  default = null
  nullable = true
}

variable "task_port" {
  description = "The port to listen on"
  type = number
  default = 80
}

variable "task_health_check_path" {
  description = "Health check path"
  type = string
  default = "/"
}

variable "include_access_logs" {
  description = "Whether to include load balancer access logs"
  type = bool
}
