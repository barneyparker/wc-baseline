resource "aws_acm_certificate" "web" {
  provider          = aws.us_east_1
  domain_name       = "${local.app_name}.${var.domain}"
  validation_method = "DNS"
}

resource "aws_route53_record" "cert_validation" {
  provider = aws.dns
  for_each = {
    for dvo in aws_acm_certificate.web.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = data.aws_route53_zone.zone.zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "web" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.web.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

resource "aws_route53_record" "web" {
  provider = aws.dns
  zone_id  = data.aws_route53_zone.zone.zone_id
  name     = "${local.app_name}.${var.domain}"
  type     = "A"

  alias {
    name                   = aws_cloudfront_distribution.web.domain_name
    zone_id                = aws_cloudfront_distribution.web.hosted_zone_id
    evaluate_target_health = false
  }
}
