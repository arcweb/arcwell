
// vpc
resource "aws_vpc" "vpc" {

  cidr_block = var.vpc_cidr

  enable_dns_support = true
  enable_dns_hostnames = true

  tags = {
    Name = "${local.resource_prefix}-vpc"
  }
}

// internet gateway
resource "aws_internet_gateway" "internet_gateway" {
  vpc_id = aws_vpc.vpc.id

  tags = {
    Name = "${local.resource_prefix}-internet-gateway"
  }
}

/*
  subnets

  We create a private and public subnets in each AZ based on the variable az count. Address blocks are created by incrementing the third octet
  with the private starting at 0 and the public starting at 100.
*/
resource "aws_subnet" "private_subnet" {
  count = local.az_count
  vpc_id = aws_vpc.vpc.id
  cidr_block = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone = "${var.region}${var.az_suffix[count.index]}"
  map_public_ip_on_launch = false

  tags = {
    Name = "${local.resource_prefix}-private-subnet-${count.index}"
  }
}

resource "aws_subnet" "public_subnet" {
  count = local.az_count
  vpc_id = aws_vpc.vpc.id
  cidr_block = cidrsubnet(var.vpc_cidr, 8, 100 + count.index)
  availability_zone = "${var.region}${var.az_suffix[count.index]}"
  map_public_ip_on_launch = true

  tags = {
    Name = "${local.resource_prefix}-public-subnet-${count.index}"
  }
}

// nat gateways
resource "aws_eip" "nat_gateway_eip" {
  count = local.az_count
  vpc = true
  depends_on = [aws_internet_gateway.internet_gateway]

  tags = {
    Name = "${local.resource_prefix}-nat-gateway-ip-${count.index}"
  }
}

resource "aws_nat_gateway" "nat_gateway" {
  count = local.az_count
  allocation_id = aws_eip.nat_gateway_eip[count.index].id
  subnet_id = aws_subnet.public_subnet[count.index].id

  tags = {
    Name = "${local.resource_prefix}-nat-gateway-${count.index}"
  }
}

/*
  route tables

  Note: You can only create routes inline or outside, but not both. We use inline.
*/
resource "aws_route_table" "public_route_table" {
  depends_on = [aws_internet_gateway.internet_gateway]
  vpc_id = aws_vpc.vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.internet_gateway.id
  }

  tags = {
    Name = "${local.resource_prefix}-public-route-table"
  }
}

resource "aws_route_table_association" "public_subnet_route_table_association" {
  count = local.az_count
  route_table_id = aws_route_table.public_route_table.id
  subnet_id = aws_subnet.public_subnet[count.index].id
}

resource "aws_route_table" "private_route_table" {
  depends_on = [aws_internet_gateway.internet_gateway]
  count = local.az_count
  vpc_id = aws_vpc.vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gateway[count.index].id
  }

  tags = {
    Name = "${local.resource_prefix}-private-route-table-${count.index}"
  }
}

resource "aws_route_table_association" "private_subnet_route_table_association" {
  count = local.az_count
  route_table_id = aws_route_table.private_route_table[count.index].id
  subnet_id = aws_subnet.private_subnet[count.index].id
}
