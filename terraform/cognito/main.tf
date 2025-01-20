resource "aws_cognito_user_pool" "user_pool" {
  name = "app_user_pool"
  password_policy {
    minimum_length = 8
    require_lowercase = true 
    require_numbers = true
    require_symbols = true
    require_uppercase = true
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
  callback_urls = ["http://localhost:3000/"]
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