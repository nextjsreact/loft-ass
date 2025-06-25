const { sql } = require('./lib/database.cjs');

(async () => {
  try {
    const tasks = await sql`SELECT id, title FROM tasks LIMIT 1`;
    if (tasks.length > 0) {
      console.log('Task found:', tasks[0]);
    } else {
      console.log('No tasks found in database');
    }
  } catch (err) {
    console.error('Error fetching tasks:', err);
  }
})();
