resource "aws_secretsmanager_secret" "secret" {
  name = local.resource_prefix
}
