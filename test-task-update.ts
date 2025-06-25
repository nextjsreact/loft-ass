import { sql, ensureSchema } from "@/lib/database"
import { updateTask, getTask } from "@/app/actions/tasks"

async function testTaskUpdate() {
  await ensureSchema()
  
  try {
    // Create a test task
    const testId = `test-${Date.now()}`
    
    // First check if task exists
    let task = await getTask(testId)
    console.log("Initial state:", task)

    // Create a test task if it doesn't exist
    if (!task) {
      await sql`
        INSERT INTO tasks (id, title, description, status, created_at, updated_at, created_by)
        VALUES (${testId}, 'Test Task', 'Initial description', 'todo', NOW(), NOW(), 'test-user')
      `
      console.log("Created test task")
    }

    // Get the task again
    task = await getTask(testId)
    console.log("After creation:", task)

    // Update the task with empty values
    await updateTask(testId, {
      title: 'Updated Title',
      description: '',
      status: 'in_progress',
      due_date: '',
      assigned_to: '',
      team_id: '',
      loft_id: ''
    })

    // Get the task again after update
    task = await getTask(testId)
    console.log("After update:", task)

    // Clean up - don't delete if running in production
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      await sql`
        DELETE FROM tasks WHERE id = ${testId}
      `
      console.log("Cleaned up test task")
    }

    return task
  } catch (error) {
    console.error("Test failed:", error)
    return null
  }
}

// Run the test
testTaskUpdate().then(result => {
  console.log("Test completed", result ? "successfully" : "with errors")
  process.exit(result ? 0 : 1)
})