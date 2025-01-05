import psycopg2
from psycopg2 import sql
import argparse
from db.config import load_config, create_database
from db.run_sql import run_sql_script

def delete_db(section: str):
    try:
        config = load_config(section=section)
        db_name = config['database']
        config['database'] = "postgres"
        conn = psycopg2.connect(**config)
        conn.autocommit = True

        with conn.cursor() as cur:
            # Form the DROP DATABASE statement
            drop_db_query = sql.SQL("DROP DATABASE {db}").format(db=sql.Identifier(db_name))
            
            # Execute the DROP DATABASE statement
            cur.execute(drop_db_query)
            print(f"Database {db_name} dropped successfully")

    except Exception as e:
        print(f"An error occurred: {e}")

    finally:
        if conn:
            conn.close()

def main():
    parser = argparse.ArgumentParser(description='Python code that runs SQL script.')
    parser.add_argument("--section", type=str, default="test", help="section for the db connection config")
    args = parser.parse_args()

    # delete original db
    delete_db(args.section)

    # create the db
    create_database(args.section)

    # run file
    run_sql_script("db/init_db.sql", args.section)
    run_sql_script("db/init_data.sql", args.section)

if __name__ == '__main__':
    main()
