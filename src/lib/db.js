import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let pool;

const getPool = () => {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is missing in environment variables");
    }

    // Check if we have a global pool
    if (global.postgresPool) {
      pool = global.postgresPool;
    } else {
      console.log("Initializing Postgres Pool (Lazy + Require)...");
      // Move import INSIDE the function to prevent top-level bundling issues with Turbopack
      const { Pool } = require('pg');

      const sslConfig = process.env.DATABASE_URL.includes("localhost")
        ? false
        : { rejectUnauthorized: false };

      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: sslConfig,
      });
      global.postgresPool = pool;
    }
  }
  return pool;
};

const db = {
  query: (text, params) => getPool().query(text, params),
  connect: () => getPool().connect(),
};

export default db;
