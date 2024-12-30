# Docker
Using postgresql docker image to test db.

## Pull Docker Image
`docker pull postgres`

## Create Docker container:
`docker run --name <DB_NAME> -e POSTGRES_PASSWORD=<PASSWORD> -d -p 5432:5432 postgres` \
`-d` for detached mode
`-e` sets the environment variable, in this case POSTGRES_PASSWORD \
`-p` expose port

## Connect to the PostgreSQL database container from terminal:
`docker exec -it driver-school-db psql -U postgres`

# Running Scripts
How to run the db scripts
## Create Database
1. To create the database, setup the connection configs to the postgresql port in `database.ini` file as provided in the example file `database.ini.example`.
2. Run the following command from the root directory of the project. \
   `python3 -m db.config --section <section_name>` \
   default section is `[test]`

## Run SQL Scripts
1. Run SQL scripts using the following command. \
   `python3 -m db.run_sql --input <file_path> --section <section_name>` \
   default section is `[test]` \
   default file is `db/init_db.sql`
