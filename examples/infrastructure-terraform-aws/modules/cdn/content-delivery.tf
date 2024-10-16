
resource "aws_cloudfront_origin_access_control" "content" {
  name = local.resource_prefix
  description = "${local.resource_prefix} origin access control"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "content" {

  enabled = true
  comment = "${local.resource_prefix} content distribution"
  default_root_object = "index.html"
  http_version = "http2"
  aliases = var.aliases
  price_class = var.price_class

  origin {
    domain_name = aws_s3_bucket.content.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.content.id
    origin_access_control_id = aws_cloudfront_origin_access_control.content.id
  }

  viewer_certificate {
    acm_certificate_arn      = var.ssl_cert_arn
    minimum_protocol_version = "TLSv1.2_2021"
    ssl_support_method       = "sni-only"
  }

  default_cache_behavior {
    cache_policy_id = var.environment == "production" ? local.cloudfront_caching_optimized : local.cloudfront_caching_disabled
    allowed_methods = ["GET", "HEAD", "OPTIONS"]
    cached_methods = ["GET", "HEAD"]
    target_origin_id = aws_s3_bucket.content.id
    viewer_protocol_policy = "redirect-to-https"
  }

  custom_error_response {
    error_caching_min_ttl = 0
    error_code = 403
    response_code = 200
    response_page_path = "/"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
      locations = []
    }
  }
}

