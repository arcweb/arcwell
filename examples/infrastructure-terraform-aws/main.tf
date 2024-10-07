terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.62.0"
    }
  }
  required_version = ">= 1.4.2"

  backend "s3" {}
}

provider "aws" {
  region = var.region

  default_tags{
    tags = {
      Environment = var.environment
      Project = var.project
      Organization = var.organization
    }
  }
}

data "aws_caller_identity" "caller_identity" {}

// module instances

module "server" {
  count = var.include_server ? 1 : 0
  source = "./modules/container"

  project = var.project
  environment = var.environment
  region = var.region
  vpc_id = aws_vpc.vpc.id
  ssl_cert_arn = var.ssl_cert_arn
  container_name = "server"
  private_subnet_ids = aws_subnet.private_subnet[*].id
  public_subnet_ids = aws_subnet.public_subnet[*].id
  domain_name = var.domain_name
  include_access_logs = var.include_access_logs
  ecs_cluster_id = aws_ecs_cluster.ecs_cluster[0].id
  task_health_check_path = "/"
  task_cpu = 1024
  task_memory = 2048
  task_port = 3333
  task_rights = []
  task_environment_variables = [
    {
      name = "APP_ENVIRONMENT"
      value = var.environment
    },
    {
      name = "NODE_ENV"
      value = var.environment == "staging" ? "test" : var.environment
    },
    {
      name = "TZ"
      value = "UTC"
    },
    {
      name = "PORT"
      value = 3333
    },
    {
      name = "HOST"
      value = "0.0.0.0"
    },
    {
      name = "LOG_LEVEL"
      value = "info"
    },
  ]
  task_secrets = [
    {
      name = "DB_HOST",
      valueFrom = "${module.server[0].task_secret_id}:DB_HOST::"
    },
    {
      name = "DB_PORT",
      valueFrom = "${module.server[0].task_secret_id}:DB_PORT::"
    },
    {
      name = "DB_USER",
      valueFrom = "${module.server[0].task_secret_id}:DB_USER::"
    },
    {
      name = "DB_PASSWORD",
      valueFrom = "${module.server[0].task_secret_id}:DB_PASSWORD::"
    },
    {
      name = "DB_DATABASE",
      valueFrom = "${module.server[0].task_secret_id}:DB_DATABASE::"
    },
    {
      name = "ARCWELL_NODE",
      valueFrom = "${module.server[0].task_secret_id}:ARCWELL_NODE::"
    },
    {
      name = "ARCWELL_KEY",
      valueFrom = "${module.server[0].task_secret_id}:ARCWELL_KEY::"
    },
    {
      name = "APP_KEY",
      valueFrom = "${module.server[0].task_secret_id}:APP_KEY::"
    },
    {
      name = "SMTP_HOST",
      valueFrom = "${module.server[0].task_secret_id}:SMTP_HOST::"
    },
    {
      name = "SMTP_PORT",
      valueFrom = "${module.server[0].task_secret_id}:SMTP_PORT::"
    },
    {
      name = "SMTP_USER",
      valueFrom = "${module.server[0].task_secret_id}:SMTP_USER::"
    },
    {
      name = "SMTP_PASSWORD",
      valueFrom = "${module.server[0].task_secret_id}:SMTP_PASSWORD::"
    },
    {
      name = "SMTP_FROM_ADDRESS",
      valueFrom = "${module.server[0].task_secret_id}:SMTP_FROM_ADDRESS::"
    },
    {
      name = "SMTP_FROM_NAME",
      valueFrom = "${module.server[0].task_secret_id}:SMTP_FROM_NAME::"
    },    {
      name = "ARCWELL_INSTANCE_NAME",
      valueFrom = "${module.server[0].task_secret_id}:ARCWELL_INSTANCE_NAME::"
    },
    {
      name = "ARCWELL_INSTANCE_ID",
      valueFrom = "${module.server[0].task_secret_id}:ARCWELL_INSTANCE_ID::"
    }
  ]
}

module "database" {
  count = var.include_db ? 1 : 0
  source = "./modules/database"
  
  project = var.project
  environment = var.environment
  vpc_id = aws_vpc.vpc.id
  db_name = "db"
  private_subnet_ids = aws_subnet.private_subnet[*].id
  domain_name = var.domain_name
  allowed_security_groups = concat(
    [
      {
        name = "bastion hosts"
        security_group_id = aws_security_group.bastion_sg.id
      }
    ],
    var.include_server ?
    [
      {
        name = "server fargate"
        security_group_id = module.server[0].fargate_sg_id
      }
    ]
    : []
  )

  db = {}
}

module "admin" {
  count = var.include_admin ? 1 : 0
  source = "./modules/cdn"

  project = var.project
  environment = var.environment
  ssl_cert_arn = var.ssl_cert_arn
  cdn_name = "admin"
  domain_name = var.domain_name
  aliases = ["admin.${var.domain_name}"]
  price_class = "PriceClass_100"
}

module "email" {
  count = var.include_email ? 1 : 0
  source = "./modules/email"

  project = var.project
  environment = var.environment
  domain_name = var.domain_name
}

module "cache" {
  count = var.include_cache ? 1 : 0
  source = "./modules/cache"

  project = var.project
  environment = var.environment
  vpc_id = aws_vpc.vpc.id
  cache_name = "cache"
  private_subnet_ids = aws_subnet.private_subnet[*].id
  domain_name = var.domain_name
  allowed_security_groups = concat(
    [
      {
        name = "bastion hosts"
        security_group_id = aws_security_group.bastion_sg.id
      }
    ],
    var.include_server ?
    [
      {
        name = "server fargate"
        security_group_id = module.server[0].fargate_sg_id
      }
    ]
    : []
  )
}
