
resource "aws_ecr_repository" "container_repository" {
  count = var.image == null ? 1 : 0
  name = local.resource_prefix
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_cloudwatch_log_group" "log_group" {
  name = "/ecs/${local.resource_prefix}"
  retention_in_days = 120
}

resource "aws_ecs_task_definition" "task_definition" {
  family = local.resource_prefix
  execution_role_arn = aws_iam_role.task_execution.arn
  task_role_arn = aws_iam_role.task.arn
  cpu = var.task_cpu
  memory = var.task_memory
  network_mode = "awsvpc"
  requires_compatibilities = ["FARGATE"]

  container_definitions = jsonencode([
    {
      name = local.resource_prefix,
      image = local.image
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group" = aws_cloudwatch_log_group.log_group.name
          "awslogs-region" = var.region
          "awslogs-stream-prefix" = "ecs"
        }
      }
      portMappings = [
        {
          containerPort = var.task_port
          hostPort = var.task_port
        }
      ]
      environment = concat([
        {
          name = "ENVIRONMENT"
          value =  var.environment
        }
      ], var.task_environment_variables)
      secrets = concat([
        {
          name = "SECRET_ENVIRONMENT"
          valueFrom = "${aws_secretsmanager_secret.secret.id}:ENVIRONMENT::"
        }
      ], var.task_secrets)
    }
  ])
}

resource "aws_ecs_service" "ecs_service" {
  name = local.resource_prefix
  cluster = var.ecs_cluster_id
  task_definition = data.aws_ecs_task_definition.latest.arn
  desired_count = 0
  force_new_deployment = true
  launch_type = "FARGATE"
  enable_execute_command = true

  network_configuration {
    assign_public_ip = false
    subnets = var.private_subnet_ids
    security_groups = [aws_security_group.fargate_sg.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.target_group.arn
    container_name = local.resource_prefix
    container_port = var.task_port
  }

  lifecycle {
    ignore_changes = [desired_count]
  }
}
