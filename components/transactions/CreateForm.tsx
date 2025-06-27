"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function CreateForm({ onSubmit }: { onSubmit: (data: any) => Promise<void> }) {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'income',
    status: 'completed',
    description: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    console.log(`Field ${name} changed to:`, value)
    setFormData(prev => ({...prev, [name]: value}))
  }

  const handleSelect = (name: string, value: string) => {
    console.log(`Select ${name} changed to:`, value)
    setFormData(prev => ({...prev, [name]: value}))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitting form data:', formData)
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Amount</Label>
        <Input 
          name="amount"
          type="number"
          value={formData.amount}
          onChange={handleChange}
        />
      </div>

      <div>
        <Label>Type</Label>
        <Select 
          value={formData.type}
          onValueChange={(value) => handleSelect('type', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Status</Label>
        <Select
          value={formData.status} 
          onValueChange={(value) => handleSelect('status', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit">Create</Button>
    </form>
  )
}
