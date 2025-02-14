# Copyright (c) HashiCorp, Inc.
# SPDX-License-Identifier: MPL-2.0

resource "aws_db_parameter_group" "db_params" {
  name   = var.customer_name
  family = "postgres14"

  parameter {
    name  = "log_connections"
    value = "1"
  }
}

resource "aws_db_instance" "postgres_db" {
  identifier             = var.customer_name
  instance_class         = "db.t3.micro"
  allocated_storage      = 5
  engine                 = "postgres"
  engine_version         = "14.12"
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = data.terraform_remote_state.vpc.outputs.private_subnet_name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  parameter_group_name   = aws_db_parameter_group.db_params.name
  publicly_accessible    = false
  skip_final_snapshot    = true
}