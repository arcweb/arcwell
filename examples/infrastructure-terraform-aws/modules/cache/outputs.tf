output "cache_user" {
  description="The cache user"
  value = aws_elasticache_user.cache.user_name
  sensitive = true
}

output "cache_password" {
  description="The generated cache password"
  value = random_password.cache_password.result
  sensitive = true
}

output "full_dns_name" {
  description = "The full dns name. Eg. server.example.com"
  value = aws_route53_record.cache_dns.fqdn
}

