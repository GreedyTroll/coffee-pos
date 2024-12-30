import psycopg2
from psycopg2 import sql
from configparser import ConfigParser

def database_exists(cur, db_name):
    try:
        cur.execute(
            "SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name=%s)",
            (db_name,)
        )
        return cur.fetchone()[0]
    except:
        raise Exception(f'error when executing SQL command for checking if database exists.')


def load_config(section='test', filename='db/database.ini'):
    parser = ConfigParser()
    parser.read(filename)
    config = {}
    if parser.has_section(section):
        params = parser.items(section)
        for param in params:
            config[param[0]] = param[1]
    else:
        raise Exception(f'Section {section} not found in the {filename} file')
    return config

def create_database(section):
    conn = None
    try:
        if not section:
            section = 'test'
        config = load_config(section)

        # Specify the new database name
        db_name = config['database']
        
        config['database'] = 'postgres' # connect to the default database
        conn = psycopg2.connect(**config)
        conn.autocommit = True  # Enable autocommit for database creation
        cursor = conn.cursor()

        if not database_exists(cursor, db_name):
            create_database_query = sql.SQL(
                "CREATE DATABASE {} WITH ENCODING 'UTF8'"
            ).format(sql.Identifier(db_name))
            # print(create_database_query)        
        
            # Create the database
            cursor.execute(create_database_query)
            print(f"Database '{db_name}' created successfully!")
            conn.commit()

    except (Exception, psycopg2.Error) as error:
        print(f"Error creating database: {error}")

    finally:
        if conn:
            cursor.close()
            conn.close()

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='Create or connect to a database.')
    parser.add_argument('--section', type=str, required=False, help='the section for the database connection.')
    
    args = parser.parse_args()
    create_database(args.section)
