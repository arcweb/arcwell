// cache
resource "aws_security_group" "cache_sg" {
  name = "${local.resource_prefix}-sg"
  description = "Controls traffic through cache"
  vpc_id = var.vpc_id
}

resource "aws_vpc_security_group_ingress_rule" "cache_redis_ingress_from_variable" {
  count = length(var.allowed_security_groups)
  security_group_id = aws_security_group.cache_sg.id

  description = var.allowed_security_groups[count.index].name
  referenced_security_group_id = var.allowed_security_groups[count.index].security_group_id
  ip_protocol = "tcp"
  from_port = 6379
  to_port = 6379
}
