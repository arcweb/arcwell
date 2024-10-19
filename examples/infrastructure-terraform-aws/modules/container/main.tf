data "aws_caller_identity" "caller_identity" {}

data "aws_subnet" "private_subnets" {
  count = length(var.private_subnet_ids)
  id = var.private_subnet_ids[count.index]
}

data "aws_route53_zone" "dns_zone" {
  name = var.domain_name
  private_zone = false
}

data "aws_ecs_task_definition" "latest" {
  task_definition = aws_ecs_task_definition.task_definition.family
}

data "aws_ecs_container_definition" latest {
  task_definition = aws_ecs_task_definition.task_definition.id
  container_name = "${var.project}-${var.environment}-${var.container_name}"
}