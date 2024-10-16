// load balancer
resource "aws_security_group" "load_balancer_sg" {
  name = "${local.resource_prefix}-load-balancer-sg"
  description = "Controls traffic through load balancer"
  vpc_id = var.vpc_id
}

resource "aws_vpc_security_group_ingress_rule" "load_balancer_ssl_ingress_from_all" {
  security_group_id = aws_security_group.load_balancer_sg.id

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "tcp"
  from_port = 443
  to_port = 443
}

resource "aws_vpc_security_group_egress_rule" "load_balancer_http_egress_to_fargate" {
  security_group_id = aws_security_group.load_balancer_sg.id

  referenced_security_group_id = aws_security_group.fargate_sg.id
  ip_protocol = "tcp"
  from_port = var.task_port
  to_port = var.task_port
}

// fargate
resource "aws_security_group" "fargate_sg" {
  name = "${local.resource_prefix}-fargate-sg"
  description = "Controls traffic through fargate instances"
  vpc_id = var.vpc_id
}

resource "aws_vpc_security_group_ingress_rule" "fargate_http_ingress_from_load_balancer" {
  security_group_id = aws_security_group.fargate_sg.id

  referenced_security_group_id = aws_security_group.load_balancer_sg.id
  ip_protocol = "tcp"
  from_port = var.task_port
  to_port = var.task_port
}

resource "aws_vpc_security_group_egress_rule" "fargate_postgres_egress_to_private_subnet" {
  count = length(data.aws_subnet.private_subnets)
  security_group_id = aws_security_group.fargate_sg.id

  cidr_ipv4 = data.aws_subnet.private_subnets[count.index].cidr_block
  ip_protocol = "tcp"
  from_port = 5432
  to_port = 5432
}

resource "aws_vpc_security_group_egress_rule" "fargate_ssl_egress_to_all" {
  security_group_id = aws_security_group.fargate_sg.id

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "tcp"
  from_port = 443
  to_port = 443
}

resource "aws_vpc_security_group_egress_rule" "fargate_ping_egress_to_all" {
  security_group_id = aws_security_group.fargate_sg.id

  cidr_ipv4 = "0.0.0.0/0"
  from_port = 8
  to_port = 0
  ip_protocol = "icmp"
}

resource "aws_vpc_security_group_egress_rule" "fargate_smtp_egress_to_all" {
  security_group_id = aws_security_group.fargate_sg.id

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "tcp"
  from_port = 587
  to_port = 587
}
