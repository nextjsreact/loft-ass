'use client'

import { TaskForm } from '@/components/forms/task-form'
import { getTask, updateTask } from '@/app/actions/tasks'
import { TaskFormData } from '@/lib/validations'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import type { Task } from '@/lib/types'

export default function EditTaskPage() {
  const params = useParams()
  const id = params.id as string
  const [task, setTask] = useState<Task | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (id) {
      getTask(id).then(setTask)
    }
  }, [id])

  const handleUpdateTask = async (data: TaskFormData) => {
    if (!id) return
    setIsSubmitting(true)
    try {
      await updateTask(id, data)
    } catch (error) {
      console.error(error)
      // Handle error state in the form
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!task) return <div>Loading...</div>

  return <TaskForm task={task} onSubmit={handleUpdateTask} isSubmitting={isSubmitting} />
}
