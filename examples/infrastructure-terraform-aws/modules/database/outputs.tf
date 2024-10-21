
output "db_password" {
  description="The generated database password"
  value = random_password.db_password.result
  sensitive = true
}

output "full_dns_name" {
  description = "The full dns name. Eg. server.example.com"
  value = aws_route53_record.database_dns.fqdn
}