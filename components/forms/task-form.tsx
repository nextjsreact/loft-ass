'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskSchema, TaskFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import type { Task } from '@/lib/types'

interface TaskFormProps {
  task?: Task
  onSubmit: (data: TaskFormData) => Promise<void>
  isSubmitting?: boolean
}

export function TaskForm({ task, onSubmit, isSubmitting = false }: TaskFormProps) {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: task ? {
      ...task,
      due_date: task.due_date ? new Date(task.due_date) : undefined,
    } : { status: 'todo' },
  })

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{task ? 'Edit Task' : 'Add New Task'}</CardTitle>
        <CardDescription>{task ? 'Update task information' : 'Create a new task'}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register('title')} />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(value) => setValue('status', value as any)} defaultValue={task?.status}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input id="due_date" type="date" {...register('due_date')} />
              {errors.due_date && <p className="text-sm text-red-500">{errors.due_date.message}</p>}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/tasks')}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}