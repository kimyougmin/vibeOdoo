import dotenv from 'dotenv'
import path from 'path'

// 서버 사이드에서만 dotenv 로드
if (typeof window === 'undefined') {
  // .env.local 파일 로드 (더 확실한 방법)
  const envPath = path.resolve(process.cwd(), '.env.local')
  console.log('Loading environment variables from:', envPath)

  const result = dotenv.config({ path: envPath })
  if (result.error) {
    console.error('Error loading .env.local file:', result.error)
  } else {
    console.log('Environment variables loaded successfully')
    console.log('Available environment variables:', Object.keys(process.env).filter(key => key.startsWith('ODOO') || key.startsWith('NEXT_PUBLIC')))
  }
}

// 환경변수 검증 함수
export function validateEnv() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_ODOO_URL',
    'NEXT_PUBLIC_ODOO_DATABASE',
    'NEXT_PUBLIC_ODOO_USERNAME',
    'NEXT_PUBLIC_ODOO_PASSWORD',
    'NEXT_PUBLIC_API_BASE_URL'
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars)
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
  }
  
  console.log('All required environment variables are set')
}

// 환경변수 가져오기 함수
export function getEnvVar(key: string): string {
  const value = process.env[key]
  if (!value) {
    console.error(`Environment variable ${key} is not set`)
    throw new Error(`Environment variable ${key} is not set`)
  }
  return value
}

// Odoo 설정 가져오기
export function getOdooConfig() {
  console.log('Getting Odoo configuration...')
  const config = {
    url: getEnvVar('NEXT_PUBLIC_ODOO_URL'),
    database: getEnvVar('NEXT_PUBLIC_ODOO_DATABASE'),
    username: getEnvVar('NEXT_PUBLIC_ODOO_USERNAME'),
    password: getEnvVar('NEXT_PUBLIC_ODOO_PASSWORD'),
  }
  console.log('Odoo configuration loaded:', { 
    url: config.url, 
    database: config.database, 
    username: config.username,
    password: '***' 
  })
  return config
} 