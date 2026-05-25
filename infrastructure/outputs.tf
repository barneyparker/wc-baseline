output "bucket_name" {
  value       = aws_s3_bucket.web.id
  description = "Name of the S3 bucket"
}

output "cloudfront_url" {
  value       = "https://${local.app_name}.${var.domain}"
  description = "CloudFront distribution URL"
}
