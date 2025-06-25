"use client"

export default function MinimalForm() {
  console.log('MinimalForm component rendering') // Debug log
  return (
    <div className="p-4 border-4 border-green-500">
      <h2 className="text-xl font-bold mb-4">Minimal Test Form</h2>
      <form>
        <div className="space-y-2">
          <label className="block">Test Input</label>
          <input 
            type="text" 
            className="border p-2 w-full"
            placeholder="Type something..."
          />
        </div>
        <button 
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-500 text-white"
        >
          Submit
        </button>
      </form>
    </div>
  )
}
