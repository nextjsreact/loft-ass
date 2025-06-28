export async function testDatabaseConnection() {
  try {
    // Check if we're on the server side
    if (typeof window !== 'undefined') {
      return { success: false, error: 'Database connection can only be tested on server side' }
    }

    // Check environment variables
    if (!process.env.DATABASE_URL) {
      return { 
        success: false, 
        error: 'DATABASE_URL environment variable is not set',
        details: 'Please check your .env file'
      }
    }

    // Validate DATABASE_URL format
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
      return {
        success: false,
        error: 'Invalid DATABASE_URL format',
        details: 'URL should start with postgresql:// or postgres://'
      }
    }

    // Try to import and initialize Neon
    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(dbUrl)

    // Test basic connection
    const result = await sql`SELECT 1 as test, NOW() as current_time`
    
    if (result && result[0] && result[0].test === 1) {
      return {
        success: true,
        message: 'Database connection successful',
        details: {
          testValue: result[0].test,
          serverTime: result[0].current_time,
          connectionString: dbUrl.replace(/:[^:@]*@/, ':****@') // Hide password
        }
      }
    } else {
      return {
        success: false,
        error: 'Unexpected response from database',
        details: result
      }
    }

  } catch (error: any) {
    // Parse different types of errors
    if (error.message?.includes('fetch failed')) {
      return {
        success: false,
        error: 'Network connection failed',
        details: 'Cannot reach the database server. Check your internet connection and database URL.',
        suggestions: [
          'Verify your DATABASE_URL is correct',
          'Check if your Neon database is active',
          'Ensure you\'re not behind a firewall blocking the connection'
        ]
      }
    }

    if (error.message?.includes('authentication failed')) {
      return {
        success: false,
        error: 'Authentication failed',
        details: 'Invalid database credentials',
        suggestions: [
          'Check your username and password in DATABASE_URL',
          'Verify the database name is correct',
          'Ensure your Neon project is not suspended'
        ]
      }
    }

    if (error.message?.includes('database') && error.message?.includes('does not exist')) {
      return {
        success: false,
        error: 'Database does not exist',
        details: 'The specified database was not found',
        suggestions: [
          'Check the database name in your CONNECTION_URL',
          'Ensure the database was created in your Neon project'
        ]
      }
    }

    return {
      success: false,
      error: 'Database connection failed',
      details: error.message || 'Unknown error',
      fullError: error
    }
  }
}