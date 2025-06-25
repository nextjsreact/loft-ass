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
}

import pkg from '@next/env'
const { loadEnvConfig } = pkg

// Load env variables from .env file
const projectDir = process.cwd()
loadEnvConfig(projectDir)

// Verify DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables')
}

// Expose minimal client-side database info
process.env.NEXT_PUBLIC_HAS_DB = 'true'
console.log('Environment variables loaded - Database connection configured')

export default nextConfig
