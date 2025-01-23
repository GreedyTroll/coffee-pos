variable "region" {
  type = string
  default = "ap-southeast-2"
}

variable "customer_name" {
  type = string
  default = "coffee-dev"
}

variable "username" {
  type = string
  default = "admin"
}

variable "password" {
  type = string
  sensitive = true
}

variable "redirect_uri" {
  type = string
  default = "http://localhost:3000/"
}