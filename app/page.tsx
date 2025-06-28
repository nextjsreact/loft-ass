import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"

export default async function HomePage() {
  // In development mode, always redirect to dashboard
  if (process.env.NODE_ENV === 'development') {
    redirect("/dashboard")
  }

  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  } else {
    redirect("/login")
  }
}