variable "folder_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "policy_arns" {
  type    = list(string)
  default = []
}

variable "environment_variables" {
  type    = map(string)
  default = {}
}