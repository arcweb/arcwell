output "fargate_sg_id" {
  description = "Id of fargate security group"
  value = aws_security_group.fargate_sg.id
}

output "task_secret_id" {
  description = "The id of the secret create for the task"
  value = aws_secretsmanager_secret.secret.id
}

output "full_dns_name" {
  description = "The full dns name. Eg. server.example.com"
  value = "${local.dns_designation}.${var.domain_name}"
}