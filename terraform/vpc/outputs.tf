# Copyright (c) HashiCorp, Inc.
# SPDX-License-Identifier: MPL-2.0

output "vpc_id"{
  description = "vpc id"
  value = module.vpc.vpc_id
}

output "private_subnets_cidr_blocks" {
  description = "private subnets cidr blocks of the vpc"
  value = module.vpc.private_subnets_cidr_blocks
}

output "private_subnets" {
  description = "private subnet ids"
  value = module.vpc.private_subnets
}

output "private_subnet_name" {
  description = "name of private subnet group"
  value = aws_db_subnet_group.private_subnet.name
}