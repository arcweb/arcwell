
# initial secrets for server
resource "aws_secretsmanager_secret_version" "server_secrets" {
  count = var.include_server && var.include_db ? 1 : 0
  secret_id = module.server[0].task_secret_id
  secret_string = jsonencode({
    ENVIRONMENT = var.environment,
    DB_HOST = module.database[0].full_dns_name,
    DB_PORT = "5432",
    DB_USER = "root",
    DB_PASSWORD = module.database[0].db_password,
    DB_DATABASE = "postgres",
    ARCWELL_NODE = "Org/PlaceHolder-Node",
    ARCWELL_KEY = "PLACE-HOLDER-KEY"
    APP_KEY = "7984E3E1-A660-4AA4-97FD-B04848621E3F"
    SMTP_HOST = "email-smtp.us-east-1.amazonaws.com"
    SMTP_PORT = "587"
    SMTP_USER = module.email[0].smtp_user
    SMTP_PASSWORD = module.email[0].smtp_password
    SMTP_FROM_ADDRESS = "no-reply@MY_DOMAIN"
    SMTP_FROM_NAME = "Admin"
    ARCWELL_INSTANCE_ID = ""
    ARCWELL_INSTANCE_NAME = ""
  })

  lifecycle {
    ignore_changes = all
  }
}
