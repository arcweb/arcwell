resource "aws_ses_domain_identity" "admin" {
    domain = var.domain_name
}

resource "aws_ses_domain_dkim" "admin" {
    domain = aws_ses_domain_identity.admin.domain
}
