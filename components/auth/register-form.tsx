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
import { Eye, EyeOff, Wrench, Bug, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { register as registerUser } from "@/lib/auth"
import { registerSchema, type RegisterFormData } from "@/lib/validations"

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isDebugging, setIsDebugging] = useState(false)
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const [showDebugSection, setShowDebugSection] = useState(false)
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
    setShowDebugSection(true)
    setError("")
    
    try {
      console.log('Starting debug registration...')
      const response = await fetch('/api/debug-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      console.log('Debug result:', result)
      
      setDebugLogs(result.logs || [])
      
      if (result.success) {
        setError(`✅ Debug successful! Registration works. Timing: ${result.timing}`)
      } else {
        setError(`❌ Debug failed: ${result.error}. Timing: ${result.timing}`)
      }
    } catch (err) {
      console.error('Debug error:', err)
      setError('❌ Debug request failed - network or server error')
      setDebugLogs(['Network error occurred during debug'])
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
      setError("⏰ Registration timed out after 30 seconds. Please try the debug option below.")
      setShowDebugSection(true)
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
        setShowDebugSection(true)
      }
    } catch (err) {
      clearTimeout(timeoutId)
      console.error('Registration error caught:', err)
      setError("An unexpected error occurred during registration")
      setShowDebugSection(true)
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
            <Alert variant={error.includes('✅') ? 'default' : 'destructive'}>
              <AlertTriangle className="h-4 w-4" />
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

          <div className="space-y-3">
            <Button type="submit" className="w-full" disabled={isLoading || isDebugging}>
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </div>
        </form>

        {/* PROMINENT DEBUG BUTTON - ALWAYS VISIBLE */}
        <div className="border-2 border-orange-400 rounded-lg p-4 bg-orange-50">
          <div className="flex items-center gap-2 mb-2">
            <Bug className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold text-orange-800">Registration Debug Tool</h3>
          </div>
          <p className="text-sm text-orange-700 mb-3">
            If registration is hanging or failing, use this debug tool to identify the issue:
          </p>
          <Button 
            type="button" 
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg border-2 border-orange-700" 
            onClick={debugRegistration}
            disabled={isLoading || isDebugging}
          >
            <Wrench className="w-4 h-4 mr-2" />
            {isDebugging ? "🔍 Debugging Registration..." : "🔧 DEBUG REGISTRATION"}
          </Button>
        </div>

        {/* Debug Logs Section */}
        {showDebugSection && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Bug className="h-4 w-4" />
                Debug Information
              </h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDebugSection(false)}
                className="text-xs"
              >
                Hide
              </Button>
            </div>
            
            {debugLogs.length > 0 ? (
              <div className="text-xs space-y-1 max-h-40 overflow-y-auto bg-white p-3 rounded border font-mono">
                {debugLogs.map((log, index) => (
                  <div key={index} className="text-gray-700 border-b border-gray-100 pb-1">{log}</div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">Click "DEBUG REGISTRATION" to see detailed logs</p>
            )}
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

        {/* Quick Test Section */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-sm text-blue-800 mb-2">💡 Quick Test Credentials</h4>
          <p className="text-xs text-blue-700 mb-2">
            Try these test credentials if registration fails:
          </p>
          <div className="text-xs space-y-1 text-blue-600 bg-white p-2 rounded border">
            <div><strong>Email:</strong> test@example.com</div>
            <div><strong>Password:</strong> password123</div>
            <div><strong>Name:</strong> Test User</div>
            <div><strong>Role:</strong> Member</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}