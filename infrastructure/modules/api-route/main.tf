module "lambda" {
  source                = "../lambda"
  folder_name           = var.folder_name
  environment           = var.environment
  policy_arns           = var.policy_arns
  environment_variables = var.environment_variables
}

resource "aws_apigatewayv2_integration" "this" {
  api_id           = var.api_id
  integration_type = "AWS_PROXY"
  integration_uri  = module.lambda.invoke_arn
}

resource "aws_apigatewayv2_route" "this" {
  api_id             = var.api_id
  route_key          = var.route_key
  target             = "integrations/${aws_apigatewayv2_integration.this.id}"
  authorizer_id      = var.authorizer_id
  authorization_type = var.authorizer_id != null ? var.authorization_type : null
}

resource "aws_lambda_permission" "this" {
  action        = "lambda:InvokeFunction"
  function_name = module.lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_execution_arn}/*/*"
}
