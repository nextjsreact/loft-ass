'use client'

import { TaskForm } from '@/components/forms/task-form'
import { createTask } from '@/app/actions/tasks'
import { TaskFormData } from '@/lib/validations'
import { useState } from 'react'

export default function NewTaskPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateTask = async (data: TaskFormData) => {
    setIsSubmitting(true)
    try {
      await createTask(data)
    } catch (error) {
      console.error(error)
      // Handle error state in the form
    } finally {
      setIsSubmitting(false)
    }
  }

  return <TaskForm onSubmit={handleCreateTask} isSubmitting={isSubmitting} />
}