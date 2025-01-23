# Copyright (c) HashiCorp, Inc.
# SPDX-License-Identifier: MPL-2.0

resource "aws_internet_gateway" "internet-gw" {
  vpc_id = data.terraform_remote_state.vpc.outputs.vpc_id
}

resource "aws_route_table" "public" {
  vpc_id = data.terraform_remote_state.vpc.outputs.vpc_id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.internet-gw.id
  }

  tags = {
    Name = var.customer_name
  }
}

resource "aws_subnet" "public" {
  vpc_id            = data.terraform_remote_state.vpc.outputs.vpc_id
  cidr_block        = "10.0.4.0/24"
  map_public_ip_on_launch = true
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

resource "aws_key_pair" "ec2_ssh" {
  key_name   = "deployer-key"
  public_key = file("~/.ssh/id_ed25519.pub")
}

resource "aws_instance" "ec2" {
  ami           = "ami-0d23792fb8b9ff2c9"
  instance_type = "t2.micro"
  subnet_id     =  aws_subnet.public.id
  security_groups = [aws_security_group.ec2_sg.id]
  associate_public_ip_address = true

  key_name = aws_key_pair.ec2_ssh.key_name

  tags = {
    Name = var.customer_name
  }
}