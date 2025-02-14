# dev notes
## python virtual env
### create
`python3 -m venv venv`
### activate
`source venv/bin/activate`
### install required packages
`pip3 install -r requirements.txt`
### verify installation
`pip3 list`
### deactivation
`deactivate`
### note!
postgresql has to be installed in order to install psycopg2 \
`brew install postgresql` on Mac.

## init postgresql db
### with docker image
1. `docker pull postgres`
2. `docker run --name <container_name> -e POSTGRES_PASSWORD=<password> -d -p 5432:5432 postgres`
3. `docker exec -it <container_name> psql -U postgres`
### init schema
1.

## Compose Docker
The only command you need to run if not building anything independently.
```
docker-compose up -d
```
## Build frontend docker image
### Build docker image
`docker build -f Dockerfile.frontend -t coffee-pos-frontend .`
### Run docker container
`docker run -d -p 443:443 coffee-pos-frontend`

## Backend Structure
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
   `docker build -f Dockerfile.backend -t coffee-pos-backend .`

## nginx
## Self-signed Certificate
For development
### Command 
`openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx.key -out nginx.crt`

## Notes
1. Current `docker-compose.yml` file is for local testing. `host.docker.internal` allows the docker container to access what is on the host.
2. The postgresql db endpoint in the `.env` file should be updated accordingly. Ultimately, it should be set to the RDS endpoint.
