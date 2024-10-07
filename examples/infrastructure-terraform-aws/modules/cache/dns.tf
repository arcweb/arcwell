resource "aws_route53_record" "cache_dns" {
  zone_id = data.aws_route53_zone.dns_zone.zone_id
  name = local.dns_designation
  type = "CNAME"
  ttl = 300
  records = [aws_elasticache_replication_group.redis.primary_endpoint_address]
}