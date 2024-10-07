data "aws_key_pair" "bastion_key" {
  key_name = var.bastion_key_name
}

resource "aws_iam_role" "bastion" {
  name = "${local.resource_prefix}-bastion"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      },
    ]
  })
}

# IAM Bastion SSM Managed Policy Attachment
resource "aws_iam_policy_attachment" "bastion_ssm_managed" {
  name       = "${local.resource_prefix}-bastion-ssm-managed"
  roles      = [aws_iam_role.bastion.id]
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "bastion" {
  name = "${local.resource_prefix}-bastion"
  role = aws_iam_role.bastion.id
}

// Setting up a bastion in each AZ for full az redundancy. The latest amazon linux ami's include SSM agent
resource "aws_instance" "bastion" {
  count = local.az_count
  ami = "ami-06e46074ae430fba6"
  subnet_id = aws_subnet.private_subnet[count.index].id
  instance_type = "t2.micro"
  key_name = data.aws_key_pair.bastion_key.key_name
  iam_instance_profile = aws_iam_instance_profile.bastion.id
  vpc_security_group_ids = [aws_security_group.bastion_sg.id]
  tags = {
    Name = "${local.resource_prefix}-bastion-${count.index}"
  }
}
