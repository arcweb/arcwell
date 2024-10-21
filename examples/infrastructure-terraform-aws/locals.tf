locals {
  resource_prefix = "${var.project}-${var.environment}"
  az_count = length(var.az_suffix)
}
