resource "aws_cognito_user_pool" "user_pool" {
  name = "app_user_pool"
  password_policy {
    minimum_length = 6
    require_numbers = true
  }
}

resource "aws_cognito_user_pool_client" "user_pool_client" {
  name         = "app_user_pool_client"
  user_pool_id = aws_cognito_user_pool.user_pool.id
  generate_secret = true
  
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows = ["code"]
  allowed_oauth_scopes = ["email", "openid", "profile"]
  supported_identity_providers = ["COGNITO"]
  explicit_auth_flows = ["USER_PASSWORD_AUTH"]
  callback_urls = ["http://localhost:3000/","https://${data.terraform_remote_state.ec2.outputs.ec2_ip}/"]
  logout_urls = ["http://localhost:3000/","https://${data.terraform_remote_state.ec2.outputs.ec2_ip}/"]
}

resource "aws_cognito_user_pool_domain" "user_pool_domain" {
  domain       = var.customer_name
  user_pool_id = aws_cognito_user_pool.user_pool.id
}

resource "aws_cognito_user" "user" {
  user_pool_id = aws_cognito_user_pool.user_pool.id
  username     = var.username
  password = var.password
  depends_on = [aws_cognito_user_pool.user_pool]
}