import { NextResponse } from 'next/server';
import { getOdooConfig, validateEnv } from '@/lib/env';

export async function GET() {
  try {
    console.log('=== Environment Variables Test ===');
    
    // 환경변수 검증
    validateEnv();
    
    // Odoo 설정 가져오기
    const odooConfig = getOdooConfig();
    
    // 모든 관련 환경변수 확인
    const envVars = {
      NEXT_PUBLIC_ODOO_URL: process.env.NEXT_PUBLIC_ODOO_URL,
      ODOO_DATABASE: process.env.ODOO_DATABASE,
      ODOO_USERNAME: process.env.ODOO_USERNAME,
      ODOO_PASSWORD: process.env.ODOO_PASSWORD ? '***' : 'NOT_SET',
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
      NEXT_PUBLIC_API_TIMEOUT: process.env.NEXT_PUBLIC_API_TIMEOUT,
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
      NODE_ENV: process.env.NODE_ENV,
    };
    
    console.log('Environment variables:', envVars);
    
    return NextResponse.json({
      success: true,
      message: 'Environment variables loaded successfully',
      odooConfig: {
        url: odooConfig.url,
        database: odooConfig.database,
        username: odooConfig.username,
        password: '***'
      },
      allEnvVars: envVars
    });
  } catch (error) {
    console.error('Environment variables test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Environment variables test failed', 
        details: (error as Error).message 
      }, 
      { status: 500 }
    );
  }
} 