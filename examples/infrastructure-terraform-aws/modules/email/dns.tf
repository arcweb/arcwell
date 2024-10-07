
resource "aws_route53_record" "example_amazonses_dkim_record" {
  count = 3
  zone_id = data.aws_route53_zone.dns_zone.zone_id
  name    = "${aws_ses_domain_dkim.admin.dkim_tokens[count.index]}._domainkey"
  type    = "CNAME"
  ttl     = "600"
  records = ["${aws_ses_domain_dkim.admin.dkim_tokens[count.index]}.dkim.amazonses.com"]
}

resource "aws_route53_record" "amazonses_dmarc_record" {
  zone_id = data.aws_route53_zone.dns_zone.zone_id
  name    = "_dmarc.${aws_ses_domain_identity.admin.domain}"
  type    = "TXT"
  ttl     = "600"
  records = ["v=DMARC1; p=none;"]
}
