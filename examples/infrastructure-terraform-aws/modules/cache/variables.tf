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

variable "cache_name" {
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

variable "node_type" {
    description = "Redis node type"
    default     = "cache.t3.small"
}
