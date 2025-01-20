# Terraform
This directory stores the configurations for AWS deployments.

## Structure
For the current project, we are using the following services in AWS: 
- `VPC`
- `EC2`
- `RDS`
- `Cognito`

If any of the components has a dependency on other ones, import of the tf states will be specified in `data.tf`. \
The following is an example of how `EC2` might be importing the `VPC` states from `ec2/data.tf`.
```
data "terraform_remote_state" "vpc" {
  backend = "local"
  config = {
    path = "../terraform_vpc/terraform.tfstate"
  }
}
```


## TF Variables
Variables for Terraform configurations can be configured according to needs. Below is how to set the variables.
### Setting TF Variables
The variables that are specified in `variables.tf` can be configured by setting the corresponding environment variables. \
Terraform reads from env variables with the prefix `TF_VAR_`. \
For example, to set the `region` variable, one can use the following command: 
```
export TF_VAR_region=<desired_region>
```
Note that the env variable is case-sensitive. Hence, neither `TF_VAR_Region` nor `TF_VAR_REGION` would work, unless it is how the variable name is specified in the `variables.tf` file.