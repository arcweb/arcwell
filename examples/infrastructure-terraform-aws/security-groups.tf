/*
  Security Groups

  Note security groups can contain inline rules. This is legacy behavior and should not be used. Instead
  aws_vpc_security_group_egress_rule and aws_vpc_security_group_ingress_rule should be used.

  It is important to understand that security group rules only really pertain to requests, not responses. So in order for someone to make a request, they must
  have an egress rule that allows them to call out on a particular port, protocol, etc. However, the response will be allowed to return on the same port with no ingress rule.
  Similarly an ingress rule must exist to allow for the receiving of a request, but no egress rule is required to send the response back over the same port / protocol.

  It is understood that it is best practice to only allow the minimum inbound traffic required to perform a system's work. However, it is also best practice to restrict
  outbound traffic to the minimum required. This is particularly important if a security breach does occur and a rogue process is launched on a system. Minimizing it's
  ability to communicate will minimize the damage it can do. Egress, does not need to be quite as strict ans ingress and often we restrict egress to the private subnets.
*/

# vpc default - this removes all rules for the vpc default security group
resource "aws_default_security_group" "vpc_default_security_group" {
  vpc_id = aws_vpc.vpc.id
}

// bastion
resource "aws_security_group" "bastion_sg" {
  name = "${local.resource_prefix}-bastion-sg"
  description = "Controls traffic through bastion hosts"
  vpc_id = aws_vpc.vpc.id
}

resource "aws_vpc_security_group_egress_rule" "bastion_postgres_egress_to_private_subnet" {
  count = length(aws_subnet.private_subnet)
  security_group_id = aws_security_group.bastion_sg.id
  description="postgres egress to private subnet ${aws_subnet.private_subnet[count.index].id}"

  cidr_ipv4 = aws_subnet.private_subnet[count.index].cidr_block
  ip_protocol = "tcp"
  from_port = 5432
  to_port = 5432
}

resource "aws_vpc_security_group_egress_rule" "bastion_ssl_egress_to_all" {
  security_group_id = aws_security_group.bastion_sg.id
  description = "ssl egress to all"

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "tcp"
  from_port = 443
  to_port = 443
}

resource "aws_vpc_security_group_egress_rule" "bastion_ping_egress_to_all" {
  security_group_id = aws_security_group.bastion_sg.id

  cidr_ipv4 = "0.0.0.0/0"
  from_port = 8
  to_port = 0
  ip_protocol = "icmp"
}
