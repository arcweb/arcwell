# Terraform - AWS Infrastructure Example

This directory contains [Terraform], infrastructure definitions, which can be used to create infrastructure to run 
[Arcwell] on [AWS] (Amazon Web Services). This example is fairly robust, but should of course, be checked for 
production readiness. It is assumed that the user of this example has familiarity with Terraform, and AWS.

## Prerequisites for Creating the Example Infrastructure
In order to install the infrastructure in this example you will need:
1. An [AWS] account
2. The [AWS CLI] installed
3. [Terraform Installed]
4. A [registered domain name] whose DNS is hosted by [AWS Route 53]
5. A wildcard [SSL certificate created through AWS] for #4
6. An [AWS key pair] for EC2 creation
7. [AWS CLI credentials] established for the shell session in which infrastructure creation happens

## Terrafrom Variable Files
There are two terraform variable files included in this example project:
1. `staging.tfvars` - Variables for a staging infrastructure
2. `production.tfvars` - Variables for a production infrastructure

There are placeholder values in these files that must be replaced with values specific to your implementation. See 
comments for example values

## Creating the Example Infrastructure
Navigate to the examples/infrastructure-terraform-aws directory from a command line interface. Make sure all 
prerequisites have been met and variable files altered, including having AWS credentials established for the command 
line session. Make sure you have rights to, and execute ./create-infrastructure.sh {project} {environment}, replacing 
project and environment with the values you used in the terraform variable files for example:

`./create-infrastructure.sh arcwell staging`

___
[Terraform]: <https://www.terraform.io>
[Arcwell]: <https://www.arcwell.health>
[AWS]: <https://aws.amazon.com>
[AWS CLI]: <https://docs.aws.amazon.com/cli/>
[Terraform Installed]: <https://developer.hashicorp.com/terraform/install>
[registered domain name]: <https://aws.amazon.com/getting-started/hands-on/get-a-domain/>
[AWS Route 53]: <https://aws.amazon.com/route53>
[SSL certificate created through AWS]: <https://docs.aws.amazon.com/acm/latest/userguide/acm-public-certificates.html>
[AWS key pair]: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/create-key-pairs.html>
[AWS CLI credentials]: <https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-authentication.html>