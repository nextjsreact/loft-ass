"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { register as registerUser } from "@/lib/auth"
import { registerSchema, type RegisterFormData } from "@/lib/validations"

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isDebugging, setIsDebugging] = useState(false)
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "member",
    },
  })

  const debugRegistration = async () => {
    const formData = getValues()
    setIsDebugging(true)
    setDebugLogs([])
    
    try {
      const response = await fetch('/api/debug-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      setDebugLogs(result.logs || [])
      
      if (result.success) {
        setError(`Debug successful! Registration works. Timing: ${result.timing}`)
      } else {
        setError(`Debug failed: ${result.error}. Timing: ${result.timing}`)
      }
    } catch (err) {
      setError('Debug request failed - network or server error')
    } finally {
      setIsDebugging(false)
    }
  }

  const onSubmit = async (data: RegisterFormData) => {
    console.log('Form submission started:', { email: data.email, role: data.role })
    setIsLoading(true)
    setError("")
    setDebugLogs([])

    // Add timeout to prevent infinite hanging
    const timeoutId = setTimeout(() => {
      setIsLoading(false)
      setError("Registration timed out after 30 seconds. Please try the debug option.")
    }, 30000)

    try {
      console.log('Calling registerUser function...')
      const result = await registerUser(data.email, data.password, data.fullName, data.role)
      clearTimeout(timeoutId)
      console.log('Registration result:', result)
      
      if (result.success) {
        console.log('Registration successful, redirecting to dashboard...')
        router.push("/dashboard")
        router.refresh()
      } else {
        console.log('Registration failed:', result.error)
        setError(result.error || "Registration failed")
      }
    } catch (err) {
      clearTimeout(timeoutId)
      console.error('Registration error caught:', err)
      setError("An unexpected error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Create account</CardTitle>
        <CardDescription className="text-center">Enter your information to create a new account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant={error.includes('successful') ? 'default' : 'destructive'}>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input 
              id="fullName" 
              placeholder="Enter your full name" 
              {...register("fullName")} 
              disabled={isLoading || isDebugging} 
            />
            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="Enter your email" 
              {...register("email")} 
              disabled={isLoading || isDebugging} 
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                {...register("password")}
                disabled={isLoading || isDebugging}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading || isDebugging}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select onValueChange={(value) => setValue("role", value as any)} defaultValue="member" disabled={isLoading || isDebugging}>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || isDebugging}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full" 
            onClick={debugRegistration}
            disabled={isLoading || isDebugging}
          >
            {isDebugging ? "Debugging..." : "🔧 Debug Registration"}
          </Button>
        </form>

        {debugLogs.length > 0 && (
          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <h4 className="font-medium mb-2">Debug Logs:</h4>
            <div className="text-xs space-y-1 max-h-40 overflow-y-auto">
              {debugLogs.map((log, index) => (
                <div key={index} className="font-mono">{log}</div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}