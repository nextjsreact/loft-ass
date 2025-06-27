export default function TransactionForm() {
  async function createTransaction(formData: FormData) {
    'use server'
    
    const rawData = {
      amount: formData.get('amount'),
      type: formData.get('type'),
      status: formData.get('status'),
      description: formData.get('description')
    }

    console.log('Raw form data:', rawData)

    // Process and validate data
    const transactionData = {
      amount: Number(rawData.amount),
      type: String(rawData.type),
      status: String(rawData.status),
      description: String(rawData.description)
    }

    console.log('Processed data:', transactionData)

    // Here you would typically save to database
    // For demo we'll just log and return void
    return
  }

  return (
    <form action={createTransaction} className="space-y-4">
      <div>
        <label>Type:</label>
        <select name="type" className="border p-2 ml-2">
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div>
        <label>Status:</label>
        <select name="status" className="border p-2 ml-2">
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div>
        <label>Amount:</label>
        <input 
          type="number" 
          name="amount"
          className="border p-2 ml-2"
        />
      </div>

      <button 
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
    </form>
  )
}
