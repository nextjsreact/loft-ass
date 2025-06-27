"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function DebugForm() {
  const [type, setType] = useState('income')
  const [status, setStatus] = useState('completed')

  const handleSubmit = async () => {
    console.log('Submitting:', { type, status })
    const res = await fetch('/api/debug-transaction', {
      method: 'POST',
      body: JSON.stringify({ type, status }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const result = await res.json()
    console.log('Server response:', result)
  }

  return (
    <div className="space-y-4 p-4">
      <div>
        <label>Type:</label>
        <select 
          value={type}
          onChange={(e) => {
            console.log('Type changed to:', e.target.value)
            setType(e.target.value)
          }}
          className="border p-2 ml-2"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div>
        <label>Status:</label>
        <select
          value={status}
          onChange={(e) => {
            console.log('Status changed to:', e.target.value)
            setStatus(e.target.value)
          }}
          className="border p-2 ml-2"
        >
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  )
}
