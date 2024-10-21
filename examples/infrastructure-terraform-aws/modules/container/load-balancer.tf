resource "aws_lb" "load_balancer" {
  name = local.resource_prefix
  internal = false
  load_balancer_type = "application"
  security_groups = [aws_security_group.load_balancer_sg.id]
  subnets = var.public_subnet_ids

    dynamic "access_logs" {
    for_each = var.include_access_logs ? [1] : []
    content {
      bucket = aws_s3_bucket.access_logs[0].id
      enabled = true
    }
  }
}

resource "aws_lb_target_group" "target_group" {
  name = local.resource_prefix
  port = var.task_port
  protocol = "HTTP"
  target_type = "ip"
  vpc_id = var.vpc_id

  health_check {
    matcher = "200"
    healthy_threshold = 5
    unhealthy_threshold = 2
    path = var.task_health_check_path
  }
}

resource "aws_lb_listener" "https_listener" {
  load_balancer_arn = aws_lb.load_balancer.arn
  port = 443
  protocol = "HTTPS"
  ssl_policy = "ELBSecurityPolicy-2016-08"
  certificate_arn = var.ssl_cert_arn

  default_action {
    type = "forward"
    target_group_arn = aws_lb_target_group.target_group.arn
  }
}
