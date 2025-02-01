# Dev Notes

## Structure
The backend of the project is located in `server/src/`

## Backend Deployment
### Dependencies
Several env variables need to be set in order to execute the backend code. These variables include:
- DATABASE_URL="postgresql+psycopg2://<root_user>:<root_password>@<db_endpoint>/CoffeeShopPOS"
- AWS_REGION
- COGNITO_USER_POOL_ID
- COGNITO_CLIENT_ID

### Flow
The deployment flow should be as follow:
1. Reserve the resources in AWS via Terraform. Collect relevant variables.
2. Set the variables in the `.env` file.
3. Build the docker image for backend project \
   `cd server/src/` \
   `docker build -t coffee-pos-backend .`
4. Deploy the docker image with `ansible`

### Quick Access
Build Docker image
```
docker build -t coffee-pos-backend .
```
Compose Docker
```
docker-compose up -d
```

## Notes
1. Current `docker-compose.yml` file is for local testing. `host.docker.internal` allows the docker container to access what is on the host.
2. The postgresql db endpoint in the `.env` file should be updated accordingly. Ultimately, it should be set to the RDS endpoint.