locals {
  resource_prefix = "${var.project}-${var.environment}-${var.cdn_name}"
  dns_designation = var.cdn_name
  cloudfront_caching_disabled = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
  cloudfront_caching_optimized = "658327ea-f89d-4fab-a63d-7e88639e58f6"
}
