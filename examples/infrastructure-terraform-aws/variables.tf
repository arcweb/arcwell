variable "region" {
  description = "AWS region"
  default = "us-east-1"
}

// This number of az suffixes will also determine the number of private subnets, public subnets, and nat gateways
variable "az_suffix" {
  description = "AWS availability zones"
  type = list(string)
  default = ["a", "b"]
}

variable "vpc_cidr" {
  description = "Address block for vpc"
  type = string
  default = "10.0.0.0/16"
}

variable "organization" {
  description = "The organization name"
  type = string
}

variable "project" {
  description = "The project name"
  type = string
}

variable "environment" {
  description = "The environment name - staging, production"
  type = string
}

variable "domain_name" {
  description = "The domain name to use for creating dns entries. Eg. example.com"
  type = string
}

variable "ssl_cert_arn" {
  description = "The arn of the ssl cert"
  type = string
}

variable "bastion_key_name" {
  description = "The EC2 KMS Key Name used for bastion hosts"
  type = string
}

variable "include_server" {
  description= "Boolean indicating if resources for a server should be included"
  type = bool
}

variable "include_db" {
  description= "Boolean indicating if resources for a db should be included"
  type = bool
}

variable "include_admin" {
  description = "Boolean indicating if resources for an admin should be included"
  type = bool
}

variable "include_cache" {
  description = "Boolean indicating if resources for a cache should be included"
  type = bool
}

variable "include_email" {
  description = "Boolean indicating if resources for simple email should be included"
  type = bool
}

variable "include_flow_logs" {
  description = "Whether to include vpc flow logs"
  type = bool
  default = false
}

variable "include_access_logs" {
  description = "Whether to include load balancer access logs"
  type = bool
  default = false
}
