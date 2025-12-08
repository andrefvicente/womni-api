import { createPool } from '@cloudflare/mysql';

export async function getMySQLConnection(env: any) {
  const pool = createPool({
    host: env.MYSQL_HOST,
    port: parseInt(env.MYSQL_PORT),
    database: env.MYSQL_DATABASE,
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    ssl: {
      rejectUnauthorized: false
    }
  });

  return pool;
} 