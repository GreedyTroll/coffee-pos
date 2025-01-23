resource "aws_security_group" "rds_sg" {
  name   = "rds_sg"
  vpc_id = data.terraform_remote_state.vpc.outputs.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = var.customer_name
  }
}

resource "aws_vpc_security_group_ingress_rule" "rds_ingress_from_bastion" {
  from_port         = 5432
  to_port           = 5432
  ip_protocol       = "tcp"
  security_group_id = aws_security_group.rds_sg.id
  referenced_security_group_id = data.terraform_remote_state.ec2.outputs.ec2_sg_id
}
