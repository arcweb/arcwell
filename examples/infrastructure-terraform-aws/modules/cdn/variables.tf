variable "project" {
  description = "The project name"
  type = string
  default = "project"
}

variable "environment" {
  description = "The environment name - staging, production"
  type = string
}

variable "cdn_name" {
  description = "The cdn name. Eg. www"
  type = string
}

variable "ssl_cert_arn" {
  description = "The arn of the ssl cert"
  type = string
}

variable "domain_name" {
  description = "The domain name to use for creating dns entries. Eg. example.com"
  type = string
}

variable "price_class" {
  description = "The cloudfront price class"
  type = string
  default = "PriceClass_All"

  validation {
    condition = var.price_class == "PriceClass_All" || var.price_class == "PriceClass_200" || var.price_class == "PriceClass_100"
    error_message = "price_class must be PriceClass_All, PriceClass_200, or PriceClass_100"
  }
}

variable "aliases" {
  description = "Aliases to use for the cloud front site"
  type = list(string)
}