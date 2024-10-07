resource "aws_ecs_cluster" "ecs_cluster" {
  count = var.include_server ? 1 : 0
  name = local.resource_prefix

  setting {
    name = "containerInsights"
    value = "enabled"
  }
}
