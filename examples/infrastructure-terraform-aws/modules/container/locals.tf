locals {
  aws_account_id = data.aws_caller_identity.caller_identity.account_id
  resource_prefix = "${var.project}-${var.environment}-${var.container_name}"
  dns_designation = var.container_name
  image = var.image == null ? "${aws_ecr_repository.container_repository[0].repository_url}:latest" : var.image

  elb_account_id = {
    "us-east-1" = "127311923021"
  }
}
