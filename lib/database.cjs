const { neon } = require("@neondatabase/serverless");
const { dbConfig } = require("./db-config.cjs");

let sql = null;

if (typeof window === 'undefined') {
  try {
    sql = neon(dbConfig.connectionString);
    console.log('Database connection established');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

module.exports = { sql };
