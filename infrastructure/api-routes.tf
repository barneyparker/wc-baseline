module "api_route" {
  source            = "./modules/api-route"
  api_id            = aws_apigatewayv2_api.api.id
  api_execution_arn = aws_apigatewayv2_api.api.execution_arn
  folder_name       = "api"
  environment       = var.environment
  route_key         = "$default"
}

module "protected_route" {
  source             = "./modules/api-route"
  api_id             = aws_apigatewayv2_api.api.id
  api_execution_arn  = aws_apigatewayv2_api.api.execution_arn
  folder_name        = "protected"
  environment        = var.environment
  route_key          = "GET /api/v1/protected"
  authorizer_id      = aws_apigatewayv2_authorizer.jwt.id
  authorization_type = "JWT"
}