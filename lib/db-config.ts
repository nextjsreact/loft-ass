// Server-side only configuration
if (typeof window === 'undefined') {
  if (!process.env.DATABASE_URL) {
    console.error('Server Error: DATABASE_URL is required in .env')
    console.log(`Looking for .env file at: ${process.cwd()}/.env`)
    console.log('Available environment variables:', Object.keys(process.env).filter(key => key.includes('DB') || key.includes('DATABASE')))
    throw new Error('Server configuration error - check server logs')
  } else {
    // Log connection info (without exposing sensitive data)
    const url = process.env.DATABASE_URL
    const maskedUrl = url.replace(/:[^:@]*@/, ':****@')
    console.log('Database URL configured:', maskedUrl)
  }
}

export const dbConfig = {
  // Only expose connection string on server
  connectionString: typeof window === 'undefined' ? process.env.DATABASE_URL : '',
  maxConnections: 5,
  idleTimeoutMillis: 30000
}