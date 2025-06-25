const { sql } = require('./lib/database.cjs');

(async () => {
  try {
    const result = await sql`SELECT 1 as test`;
    console.log('Database connection successful:', result[0].test);
  } catch (err) {
    console.error('Database connection failed:', err);
  }
})();
