import psycopg2
import argparse
from db.config import load_config

def run_sql_script(filename: str, section: str):
    conn = None
    try:
        config = load_config(section=section)
        conn = psycopg2.connect(**config)
        cursor = conn.cursor()

        # Read SQL script from file
        with open(filename, 'r') as sql_file:
            sql_script = sql_file.read()

        # Execute the script
        cursor.execute(sql_script)
        conn.commit()

        print("SQL script executed successfully!")

    except (Exception, psycopg2.Error) as error:
        print(f"Error executing SQL script: {error}")

    finally:
        if conn:
            cursor.close()
            conn.close()

def main():
    parser = argparse.ArgumentParser(description='Python code that runs SQL script.')
    parser.add_argument("--input", type=str, default="db/init_db.sql", help="File name for the SQL script to be run")
    parser.add_argument("--section", type=str, default="test", help="section for the db connection config")
    args = parser.parse_args()

    # Access the parsed argument
    run_sql_script(args.input, args.section)

if __name__ == '__main__':
    main()
