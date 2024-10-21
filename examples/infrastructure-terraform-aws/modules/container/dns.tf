
resource "aws_route53_record" "load_balancer_dns" {
  zone_id = data.aws_route53_zone.dns_zone.zone_id
  name = local.dns_designation
  type = "A"

  alias {
    name = aws_lb.load_balancer.dns_name
    zone_id = aws_lb.load_balancer.zone_id
    evaluate_target_health = true
  }
}
