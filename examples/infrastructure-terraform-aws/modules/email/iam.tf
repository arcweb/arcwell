resource "aws_iam_group" "smtp_users_group" {
  name = "${local.resource_prefix}-smtp_users"
}

resource "aws_iam_user" "smpt_user" {
  name = "${local.resource_prefix}-smtp"
}

resource "aws_iam_user_group_membership" "smtp_user_group_membership" {
  user = aws_iam_user.smpt_user.name

  groups = [
    aws_iam_group.smtp_users_group.name,
  ]
}

resource "aws_iam_group_policy" "smtp_user_group_policy" {
  name  = "smtp_user_group_policy"
  group = aws_iam_group.smtp_users_group.name

  policy = jsonencode({
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
              "ses:SendEmail",
              "ses:SendRawEmail",
            ]
            "Resource": "*"
        }
    ]
  })
}

resource "aws_iam_access_key" "smtp_user_access_key" {
  user = aws_iam_user.smpt_user.name
}
