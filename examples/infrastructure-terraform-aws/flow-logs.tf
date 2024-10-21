
resource "aws_s3_bucket" "flow_logs" {
  count = var.include_flow_logs ? 1 : 0
  bucket = "${local.resource_prefix}-flow-logs"
}

# S3 Admin Files Bucket Server Side Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "flow_logs" {
  count = var.include_flow_logs ? 1 : 0
  bucket = aws_s3_bucket.flow_logs[0].bucket

  # enable default aws:kms encryption with AWS S3 key
  rule {
      apply_server_side_encryption_by_default {
          sse_algorithm = "AES256"
      }
  }
}

# S3 Admin Files Public Access Block All
resource "aws_s3_bucket_public_access_block" "flow_logs" {
  count = var.include_flow_logs ? 1 : 0
  bucket = aws_s3_bucket.flow_logs[0].bucket

  block_public_acls = true
  block_public_policy = true
  ignore_public_acls = true
  restrict_public_buckets = true
}

resource "aws_flow_log" "flow_logs" {
  count = var.include_flow_logs ? 1 : 0
  log_destination = aws_s3_bucket.flow_logs[0].arn
  log_destination_type = "s3"
  traffic_type = "ALL"
  vpc_id = aws_vpc.vpc.id
}
