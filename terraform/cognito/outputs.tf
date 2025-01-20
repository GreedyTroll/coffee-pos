# Copyright (c) HashiCorp, Inc.
# SPDX-License-Identifier: MPL-2.0

output "userpool_id" {
    description = "The ID of the user pool"
    value       = aws_cognito_user_pool.user_pool.id
}

output "access_token_url" {
    description = "access token url"
    value = "https://${aws_cognito_user_pool_domain.user_pool_domain.domain}.auth.${var.region}.amazoncognito.com/oauth2/token"
}

locals {
    encoded_redirect_uri = replace(replace(replace(replace(var.redirect_uri, ":", "%3A"), "/", "%2F"), "?", "%3F"), "&", "%26")
}

output "auth_url" {
    description = "authentication url"
    value = "https://${aws_cognito_user_pool_domain.user_pool_domain.domain}.auth.${var.region}.amazoncognito.com/login?response_type=code&client_id=${aws_cognito_user_pool_client.user_pool_client.id}&redirect_uri=${local.encoded_redirect_uri}"
}

