terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }

  required_version = "~> 1.15"

  backend "s3" {
    region       = "eu-west-1"
    bucket       = "pwp-tfstate"
    key          = "wc-baseline/terraform.tfstate"
    encrypt      = true
    use_lockfile = true
  }
}

locals {
  # Create an app name dependent on deployment environment
  app_name = var.environment == "prod" ? var.app_name : "${var.app_name}-${var.environment}"

  auth_origin = "auth.${var.domain}"

  default_tags = {
    Application = local.app_name
    project_url = var.project_url
    environment = var.environment
  }
}

provider "aws" {
  region = "eu-west-1"

  assume_role {
    role_arn = "arn:aws:iam::${var.account_id}:role/DeploymentRole"
  }

  default_tags {
    tags = local.default_tags
  }
}

provider "aws" {
  alias  = "dns"
  region = "eu-west-1"

  assume_role {
    role_arn = "arn:aws:iam::610879547730:role/core_dns"
  }

  default_tags {
    tags = local.default_tags
  }
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  assume_role {
    role_arn = "arn:aws:iam::${var.account_id}:role/DeploymentRole"
  }

  default_tags {
    tags = local.default_tags
  }
}

data "aws_route53_zone" "zone" {
  provider = aws.dns

  name         = var.domain
  private_zone = false
}