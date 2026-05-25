variable "app_name" {
  type        = string
  description = "Application internal name"
  default     = "wcbase"
}

variable "project_url" {
  type        = string
  description = "Project URL provided by GitHub Actions"
}

variable "environment" {
  type        = string
  description = "Environemnt name (prod or sanitized branch)"
}

variable "account_id" {
  type        = string
  description = "AWS Account id for the deployment"
}

variable "domain" {
  type        = string
  description = "Base domain"
  default     = "barneyparker.com"
}


