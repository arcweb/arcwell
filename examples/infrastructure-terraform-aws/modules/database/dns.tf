resource "aws_route53_record" "database_dns" {
  zone_id = data.aws_route53_zone.dns_zone.zone_id
  name = local.dns_designation
  type = "CNAME"
  ttl = 300
  records = [aws_rds_cluster_instance.db_instance.endpoint]
}