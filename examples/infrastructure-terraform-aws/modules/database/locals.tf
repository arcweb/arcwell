locals {
  resource_prefix = "${var.project}-${var.environment}-${var.db_name}"
  dns_designation = var.db_name
}
