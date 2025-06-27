"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("@/lib/database");
const tasks_1 = require("@/app/actions/tasks");
async function testTaskUpdate() {
    await (0, database_1.ensureSchema)();
    try {
        // Create a test task
        const testId = `test-${Date.now()}`;
        // First check if task exists
        let task = await (0, tasks_1.getTask)(testId);
        console.log("Initial state:", task);
        // Create a test task if it doesn't exist
        if (!task) {
            await (0, database_1.sql) `
        INSERT INTO tasks (id, title, description, status, created_at, updated_at, created_by)
        VALUES (${testId}, 'Test Task', 'Initial description', 'todo', NOW(), NOW(), 'test-user')
      `;
            console.log("Created test task");
        }
        // Get the task again
        task = await (0, tasks_1.getTask)(testId);
        console.log("After creation:", task);
        // Update the task with empty values
        await (0, tasks_1.updateTask)(testId, {
            title: 'Updated Title',
            description: '',
            status: 'in_progress',
            due_date: '',
            assigned_to: '',
            team_id: '',
            loft_id: ''
        });
        // Get the task again after update
        task = await (0, tasks_1.getTask)(testId);
        console.log("After update:", task);
        // Clean up - don't delete if running in production
        if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
            await (0, database_1.sql) `
        DELETE FROM tasks WHERE id = ${testId}
      `;
            console.log("Cleaned up test task");
        }
        return task;
    }
    catch (error) {
        console.error("Test failed:", error);
        return null;
    }
}
// Run the test
testTaskUpdate().then(result => {
    console.log("Test completed", result ? "successfully" : "with errors");
    process.exit(result ? 0 : 1);
});
