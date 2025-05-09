import { Pool } from "pg";
import logger from "../utils/logger.js";
import dotenv from "dotenv";

// Dynamically load dotenv based on the environment
if (process.env.NODE_ENV === 'test') {
  logger.info("Test environment detected. Using test database config.");
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config(); // defaults to .env
}

// ✅ Now destructure safely
const { DB_USER, DB_HOST, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

if (!DB_USER || !DB_HOST || !DB_PASSWORD || !DB_NAME || !DB_PORT) {
  logger.error(
    "Database environment variables are missing. Create or check your .env file"
  );
  process.exit(1);
}

// ... keep the rest of your code unchanged ✅


const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: parseInt(DB_PORT, 10),
  connectionTimeoutMillis: 2000,
});

logger.info(`Database has been configured for ${DB_NAME} database`);

pool.on("connect", (client) => {
  logger.info(`Client connected from Pool (Total count: ${pool.totalCount})`);
});

pool.on("error", (err, client) => {
  logger.error("Unexpected error on idle client in pool", err);
  process.exit(-1);
});


async function initializeDbSchema() {
    const client = await pool.connect()

    try{
        logger.info("Initializing database schema");
        await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto");

        await client.query(`
            CREATE TABLE IF NOT EXISTS users(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            username VARCHAR(100) UNIQUE NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            is_verified BOOLEAN DEFAULT false,
            verification_token TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

       `);
        logger.info("Users table has been created successfully")


        await client.query(`
            CREATE TABLE IF NOT EXISTS short_urls(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            short_code VARCHAR(10) UNIQUE NOT NULL,
            long_url VARCHAR(255) NOT NULL,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            short_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP,
            clicks INTEGER DEFAULT 0
            );
       `);

      
       await client.query(`
        CREATE INDEX IF NOT EXISTS idx_short_urls_user_id ON short_urls(user_id);
      `);
        logger.info("Short Urls table has been created successfully")

        await client.query(`
          CREATE TABLE IF NOT EXISTS click_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          url_id UUID REFERENCES short_urls(id) ON DELETE CASCADE,
          clicked_at TIMESTAMP DEFAULT NOW()
          );
     `);

    
     await client.query(`
      CREATE INDEX IF NOT EXISTS idx_click_logs_url_id ON click_logs(url_id);
    `);
      logger.info("Short Urls table has been created successfully")

    }
    catch (error) {
        logger.error(`Error while initializing the schema`, error);
        process.exit(1);
      } finally {
        client.release();
      }
}


async function connectToDb() {
    try {
      const client = await pool.connect();
      logger.info(`Database connection pool established successfully`);
      client.release();
    } catch (error) {
      logger.error("Unable to establish database connection pool", error);
      process.exit(1);
    }
  }
  
  async function query(text, params) {
    const start = Date.now();
    try {
      const response = await pool.query(text, params);
      const duration = Date.now() - start;
      logger.info(
        `Executed query: { text: ${text.substring(
          0,
          100
        )}..., params: ${JSON.stringify(
          params
        )}, duration: ${duration}ms, rows: ${response.rowCount}}`
      );
      return response;
    } catch (error) {
      logger.error(
        `Error executing query: { text: ${text.substring(
          0,
          100
        )}..., params: ${JSON.stringify(params)}, error: ${error.message}}`
      );
      throw error;
    }
  }
  
  export { pool, connectToDb, initializeDbSchema, query };
  