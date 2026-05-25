resource "aws_apigatewayv2_api" "api" {
  name          = "${local.app_name}-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "api" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_authorizer" "jwt" {
  api_id           = aws_apigatewayv2_api.api.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "${local.app_name}-jwt-auth"

  jwt_configuration {
    audience = ["wcbase-api"]
    issuer   = "https://auth.${var.domain}"
  }
}
