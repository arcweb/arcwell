resource "aws_s3_bucket" "content" {
  bucket = "${local.resource_prefix}-ex-content"
}

resource "aws_s3_bucket_public_access_block" "content" {
  bucket = aws_s3_bucket.content.bucket

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

data "aws_iam_policy_document" "content" {
  statement {
    principals {
      type = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    actions = [
      "s3:getObject"
    ]
    resources = [
      "${aws_s3_bucket.content.arn}/*"
    ]
    condition {
      test     = "StringEquals"
      values   = ["arn:aws:cloudfront::${data.aws_caller_identity.caller_identity.account_id}:distribution/${aws_cloudfront_distribution.content.id}"]
      variable = "AWS:SourceArn"
    }
  }
}

resource "aws_s3_bucket_policy" "content" {
  bucket = aws_s3_bucket.content.bucket
  policy = data.aws_iam_policy_document.content.json
}

resource "aws_kms_key" "content" {
  description = "KMS key used to encrypt the s3 bucket"
  deletion_window_in_days = 10
  policy = jsonencode({
    Id  = "cdn_content_policy"
    Statement = [
      {
        "Sid" : "Allow access through S3 for all principals in the account that are authorized to use S3",
        "Effect" : "Allow",
        "Principal" : {
          "AWS" : "*"
        },
        "Action" : [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:DescribeKey"
        ],
        "Resource" : "*",
        "Condition" : {
          "StringEquals" : {
            "kms:ViaService" : "s3.us-east-1.amazonaws.com",
            "kms:CallerAccount" : data.aws_caller_identity.caller_identity.account_id
          }
        }
      },
      {
        "Sid": "Allow all access to root",
        "Effect": "Allow",
        "Principal": {
          "AWS": "arn:aws:iam::${data.aws_caller_identity.caller_identity.account_id}:root"
        },
        "Action": "kms:*",
        "Resource": "*"
      },
      {
        "Sid": "AllowCloudFrontServicePrincipalSSE-KMS",
        "Effect": "Allow",
        "Principal": {
          "AWS": "arn:aws:iam::${data.aws_caller_identity.caller_identity.account_id}:root",
          "Service": "cloudfront.amazonaws.com"
        },
        "Action": [
          "kms:Decrypt",
          "kms:Encrypt",
          "kms:GenerateDataKey*"
        ],
        "Resource": "*",
        "Condition": {
          "StringEquals": {
              "AWS:SourceArn": "arn:aws:cloudfront::${data.aws_caller_identity.caller_identity.account_id}:distribution/${aws_cloudfront_distribution.content.id}"
          }
        }
      }
    ]
    Version = "2012-10-17"
  })
}

resource "aws_s3_bucket_server_side_encryption_configuration" "content" {
  bucket = aws_s3_bucket.content.bucket

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.content.arn
      sse_algorithm = "aws:kms"
    }
  }
}
