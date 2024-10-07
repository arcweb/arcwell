
output "content_domain_name" {
  description = "The cloudfront distribution domain name"
  value = aws_cloudfront_distribution.content.domain_name
}

output "content_hosted_zone_id" {
  description = "The cloudfront distribution zone id"
  value = aws_cloudfront_distribution.content.hosted_zone_id
}