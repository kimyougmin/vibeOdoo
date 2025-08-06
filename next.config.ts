import type { NextConfig } from 'next'
import dotenv from 'dotenv'

// .env 파일 로드
dotenv.config({ path: '.env.local' })

const nextConfig: NextConfig = {
  /* config options here */
}

export default nextConfig
