output "smtp_iam_user" {
  description="The smtp user name"
  value = aws_iam_user.smpt_user.name
}

output "smtp_user" {
  description = "The generated access key of the smtp user"
  value = aws_iam_access_key.smtp_user_access_key.id
  sensitive = true
}

output "smtp_password" {
  description = "The generated access key of the smtp user"
  value = aws_iam_access_key.smtp_user_access_key.ses_smtp_password_v4
  sensitive = true
}
