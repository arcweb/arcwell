data "aws_caller_identity" "caller_identity" {}

data "aws_route53_zone" "dns_zone" {
  name = var.domain_name
  private_zone = false
}
