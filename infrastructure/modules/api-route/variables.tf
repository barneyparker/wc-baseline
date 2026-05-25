variable "api_id" {
  type = string
}

variable "api_execution_arn" {
  type = string
}

variable "folder_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "route_key" {
  type = string
}

variable "authorizer_id" {
  type    = string
  default = null
}

variable "authorization_type" {
  type    = string
  default = null
}

variable "policy_arns" {
  type    = list(string)
  default = []
}

variable "environment_variables" {
  type    = map(string)
  default = {}
}
