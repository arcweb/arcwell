data "aws_iam_policy_document" "task_execution_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "task_execution" {
  name = "${local.resource_prefix}-task-execution"
  assume_role_policy = data.aws_iam_policy_document.task_execution_assume_role.json
}

data "aws_iam_policy_document" "task_execution" {
  statement {
    actions = [
      "ecr:GetAuthorizationToken",
      "secretsmanager:ListSecrets",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [
      "*"
    ]
  }
  statement {
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:BatchGetImage",
      "ecr:GetDownloadUrlForLayer",
    ]
    resources = [
      "arn:aws:ecr:${var.region}:${local.aws_account_id}:repository/${local.resource_prefix}"
    ]
  }
  statement {
    actions = [
      "secretsmanager:GetResourcePolicy",
      "secretsmanager:GetSecretValue",
      "secretsmanager:DescribeSecret",
      "secretsmanager:ListSecretVersionIds"
    ]
    resources = [
      "arn:aws:secretsmanager:${var.region}:${local.aws_account_id}:secret:${local.resource_prefix}*"
    ]
  }
}

resource "aws_iam_policy" "task_execution" {
  name        = "${local.resource_prefix}-task-execution-policy"
  description = "Rights for ${local.resource_prefix} execution"
  policy = data.aws_iam_policy_document.task_execution.json
}

resource "aws_iam_role_policy_attachment" "task_execution" {
  role = aws_iam_role.task_execution.name
  policy_arn = aws_iam_policy.task_execution.arn
}
