resource "aws_route53_record" "cdn_dns" {
  zone_id = data.aws_route53_zone.dns_zone.zone_id
  name = local.dns_designation
  type = "A"

  alias {
    name = aws_cloudfront_distribution.content.domain_name
    zone_id = aws_cloudfront_distribution.content.hosted_zone_id
    evaluate_target_health = true
  }
}
