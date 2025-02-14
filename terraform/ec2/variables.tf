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