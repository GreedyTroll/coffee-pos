output "ec2_ip" {
  description = "public ip of ec2 instance"
  value = aws_instance.ec2.public_ip
}

output "ec2_id" {
  description = "id of ec2 instance"
  value = aws_instance.ec2.id
}

output "ec2_sg_id" {
  description = "id of ec2 security group"
  value = aws_security_group.ec2_sg.id
}