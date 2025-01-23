# Copyright (c) HashiCorp, Inc.
# SPDX-License-Identifier: MPL-2.0

variable "region" {
  default     = "ap-southeast-2"
  description = "AWS region"
}

variable "customer_name" {
  description = "customer name"
  default     = "coffee-dev"
}

variable "db_username" {
  description = "database username"
  default     = "coffee_dev"
}

variable "db_password" {
  description = "database password"
  sensitive = true
}