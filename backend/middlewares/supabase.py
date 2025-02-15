import functools

import psycopg2

from backend.config import config


def logs_table_exists(func):
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        conn, cur = None, None
        try:
            conn = psycopg2.connect(config.supabase_direct_url)
            cur = conn.cursor()

            cur.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'logs');")
            table_exists = cur.fetchone()[0]

            if not table_exists:
                create_table_sql = """
                CREATE TABLE IF NOT EXISTS logs (
                    id SERIAL PRIMARY KEY,
                    user_name TEXT,
                    user_avatar TEXT,
                    action TEXT,
                    created_at TIMESTAMPTZ
                );
                """
                cur.execute(create_table_sql)
                conn.commit()

        except (Exception, psycopg2.Error):
            if conn:
                conn.rollback()
            raise

        finally:
            if conn:
                if cur:
                    cur.close()
                conn.close()

        return await func(*args, **kwargs)

    return wrapper
