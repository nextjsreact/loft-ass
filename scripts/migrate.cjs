const fs = require('fs');
const { sql } = require('../lib/database.cjs');

const runMigrations = async () => {
  const query = fs.readFileSync('./scripts/06-create-categories-table.sql', 'utf-8');
  await sql.query(query);
  console.log('Migration complete!');
};

runMigrations();