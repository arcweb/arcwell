variable "project" {
  description = "The project name"
  type = string
  default = "project"
}

variable "environment" {
  description = "The environment name - staging, production"
  type = string
}

variable "domain_name" {
  description = "The domain name to use for creating dns entries. Eg. example.com"
  type = string
}
