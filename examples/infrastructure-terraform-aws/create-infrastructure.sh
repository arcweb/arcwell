#!/bin/bash

project=$1
environment=$2

if [ -z $project ] || [ -z $environment ]; then
  echo project and environment arguments are required
  exit 1
fi

bucket="${project}-${environment}-terraform-ex"
echo Checking terraform state bucket status
bucketstatus=$(aws s3api head-bucket --bucket "${bucket}" 2>&1)

# create state bucket if needed
if echo "${bucketstatus}" | grep 'Not Found' ||
   echo "${bucketstatus}" | grep 'Forbidden'; then
  echo Creating terraform state bucket
  aws s3api create-bucket --bucket $bucket
  echo Setting terraform state bucket versioning
  aws s3api put-bucket-versioning --bucket $bucket --versioning-configuration MFADelete=Disabled,Status=Enabled
fi

# initialize terraform
echo Initializing Terraform
terraform init -backend-config=bucket=$bucket -backend-config=key=state -backend-config=region=us-east-1

# validate terraform configuration
echo Validating Terraform
terraform validate

# apply terraform configuration
terraform apply -var-file="${environment}.tfvars"
