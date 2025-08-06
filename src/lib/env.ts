import dotenv from 'dotenv'
import path from 'path'

// .env.local 파일 로드
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// 환경변수 검증 함수
export function validateEnv() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_ODOO_URL',
    'ODOO_DATABASE',
    'ODOO_USERNAME',
    'ODOO_PASSWORD',
    'NEXT_PUBLIC_API_BASE_URL'
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
  }
}

// 환경변수 가져오기 함수
export function getEnvVar(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`)
  }
  return value
}

// Odoo 설정 가져오기
export function getOdooConfig() {
  return {
    url: getEnvVar('NEXT_PUBLIC_ODOO_URL'),
    database: getEnvVar('ODOO_DATABASE'),
    username: getEnvVar('ODOO_USERNAME'),
    password: getEnvVar('ODOO_PASSWORD'),
  }
} 