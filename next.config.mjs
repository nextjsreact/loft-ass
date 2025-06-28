/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add experimental features for better Neon compatibility
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless'],
  },
}

import pkg from '@next/env'
const { loadEnvConfig } = pkg

// Load env variables from .env file
const projectDir = process.cwd()
loadEnvConfig(projectDir)

// Verify DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in environment variables')
  console.error('Please check your .env file contains:')
  console.error('DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"')
  throw new Error('DATABASE_URL is not set in environment variables')
}

// Validate DATABASE_URL format
if (!process.env.DATABASE_URL.startsWith('postgresql://') && !process.env.DATABASE_URL.startsWith('postgres://')) {
  console.error('❌ Invalid DATABASE_URL format')
  console.error('Expected format: postgresql://username:password@host:port/database?sslmode=require')
  throw new Error('Invalid DATABASE_URL format')
}

// Log successful configuration (without exposing sensitive data)
const maskedUrl = process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@')
console.log('✅ Environment variables loaded - Database connection configured')
console.log('📍 Database URL:', maskedUrl)

export default nextConfig