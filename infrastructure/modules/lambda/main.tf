data "archive_file" "dummy" {
  type        = "zip"
  output_path = "${path.module}/../../../.build/${var.environment}-${var.folder_name}-dummy.zip"
  source {
    content  = "// placeholder deployed by Terraform; real code uploaded by CI"
    filename = "index.mjs"
  }
}

resource "aws_iam_role" "this" {
  name = "${var.environment}-${var.folder_name}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "basic" {
  role       = aws_iam_role.this.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "extra" {
  for_each   = toset(var.policy_arns)
  role       = aws_iam_role.this.name
  policy_arn = each.value
}

resource "aws_lambda_function" "this" {
  function_name    = "${var.environment}-${var.folder_name}"
  role             = aws_iam_role.this.arn
  handler          = "index.handler"
  runtime          = "nodejs22.x"
  filename         = data.archive_file.dummy.output_path
  source_code_hash = data.archive_file.dummy.output_base64sha256

  dynamic "environment" {
    for_each = length(var.environment_variables) > 0 ? [var.environment_variables] : []
    content {
      variables = environment.value
    }
  }
}
