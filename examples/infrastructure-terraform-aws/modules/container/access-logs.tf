// Access logs bucket
resource "aws_s3_bucket" "access_logs" {
  count = var.include_access_logs ? 1 : 0
  bucket = "${local.resource_prefix}-access-logs"
}

// S3 Admin Files Bucket Server Side Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "access_logs" {
  count = var.include_access_logs ? 1 : 0
  bucket = aws_s3_bucket.access_logs[0].bucket

  # enable default aws:kms encryption with AWS S3 key
  rule {
      apply_server_side_encryption_by_default {
          sse_algorithm = "AES256"
      }
  }
}

// S3 Admin Files Public Access Block All
resource "aws_s3_bucket_public_access_block" "access_logs" {
  count = var.include_access_logs ? 1 : 0
  bucket = aws_s3_bucket.access_logs[0].bucket

  block_public_acls = true
  block_public_policy = true
  ignore_public_acls = true
  restrict_public_buckets = true
}

// Allow load balancer access to bucket
data "aws_iam_policy_document" "access_logs" {
  count = var.include_access_logs ? 1 : 0
  statement {
    actions = ["s3:PutObject"]
    resources = ["arn:aws:s3:::${local.resource_prefix}-access-logs/AWSLogs/${data.aws_caller_identity.caller_identity.account_id}/*"]
    principals {
      type = "AWS"
      identifiers = ["arn:aws:iam::${local.elb_account_id[var.region]}:root"]
    }
  }
}

resource "aws_s3_bucket_policy" "access_logs" {
  count = var.include_access_logs ? 1 : 0
  bucket = aws_s3_bucket.access_logs[0].id
  policy = data.aws_iam_policy_document.access_logs[0].json
}
