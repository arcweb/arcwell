locals {
  resource_prefix = "${var.project}-${var.environment}-${var.cache_name}"
  dns_designation = var.cache_name
}
