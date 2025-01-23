resource "aws_security_group" "ec2_sg" {
  name = "ec2_sg"
  vpc_id = data.terraform_remote_state.vpc.outputs.vpc_id
  tags = {
    Name = var.customer_name
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_vpc_security_group_ingress_rule" "ec2_ingress_ssh" {
  from_port         = 22
  to_port           = 22
  ip_protocol          = "tcp"
  security_group_id = aws_security_group.ec2_sg.id
  cidr_ipv4       = "0.0.0.0/0"
}

resource "aws_vpc_security_group_ingress_rule" "ec2_ingress_https" {
  from_port         = 443
  to_port           = 443
  ip_protocol          = "tcp"
  security_group_id = aws_security_group.ec2_sg.id
  cidr_ipv4       = "0.0.0.0/0"
}
