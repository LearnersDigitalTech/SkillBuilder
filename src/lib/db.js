import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let pool;

const getPool = () => {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is missing in environment variables");
    }

    // Check if we have a global pool
    // Check if we have a global pool
    if (global.postgresPool_debug) {
      pool = global.postgresPool_debug;
    } else {
      console.log("Initializing Postgres Pool (Lazy + Require)...");
      // Move import INSIDE the function to prevent top-level bundling issues with Turbopack
      const { Pool } = require('pg');

      // Force SSL false for now since script worked with it
      const sslConfig = false;

      console.log(`DB Connection: Using SSL=${sslConfig} for host: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0]}`);

      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: sslConfig,
        connectionTimeoutMillis: 5000,
      });
      global.postgresPool_debug = pool;
    }
  }
  return pool;
};

const db = {
  query: (text, params) => getPool().query(text, params),
  connect: () => getPool().connect(),
};

export default db;
