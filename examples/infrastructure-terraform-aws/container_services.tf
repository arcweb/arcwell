resource "aws_ecs_cluster" "ecs_cluster" {
  count = 1
  name = local.resource_prefix

  setting {
    name = "containerInsights"
    value = "enabled"
  }
}
