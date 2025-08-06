import type { NextConfig } from 'next'
import dotenv from 'dotenv'
import path from 'path'

// .env 파일 로드 (더 확실한 방법)
const envPath = path.resolve(process.cwd(), '.env.local')
console.log('Next.js loading environment variables from:', envPath)

const result = dotenv.config({ path: envPath })
if (result.error) {
  console.error('Error loading .env.local file in Next.js config:', result.error)
} else {
  console.log('Environment variables loaded successfully in Next.js config')
}

const nextConfig: NextConfig = {
  /* config options here */
}

export default nextConfig
