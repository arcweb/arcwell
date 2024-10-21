data "aws_iam_policy_document" "task_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "task" {
  name = "${local.resource_prefix}-task"
  assume_role_policy = data.aws_iam_policy_document.task_assume_role.json
}

data "aws_iam_policy_document" "task" {
  statement {
    actions = [
      "ssmmessages:CreateControlChannel",
      "ssmmessages:CreateDataChannel",
      "ssmmessages:OpenControlChannel",
      "ssmmessages:OpenDataChannel"
    ]
    resources = [
      "*"
    ]
  }

  dynamic "statement" {
    for_each = var.task_rights
    content {
      actions = statement.value.actions
      resources = statement.value.resources
    }
  }
}

resource "aws_iam_policy" "task" {
  name        = "${local.resource_prefix}-task-policy"
  description = "Rights for ${local.resource_prefix}"
  policy = data.aws_iam_policy_document.task.json
}

resource "aws_iam_role_policy_attachment" "task" {
  role = aws_iam_role.task.name
  policy_arn = aws_iam_policy.task.arn
}
