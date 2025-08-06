import { NextResponse } from 'next/server';

export async function GET() {
  console.log('=== Simple Environment Variables Test ===');
  
  const envVars = {
    NEXT_PUBLIC_ODOO_URL: process.env.NEXT_PUBLIC_ODOO_URL,
    NEXT_PUBLIC_ODOO_DATABASE: process.env.NEXT_PUBLIC_ODOO_DATABASE,
    NEXT_PUBLIC_ODOO_USERNAME: process.env.NEXT_PUBLIC_ODOO_USERNAME,
    NEXT_PUBLIC_ODOO_PASSWORD: process.env.NEXT_PUBLIC_ODOO_PASSWORD ? '***' : 'NOT_SET',
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  };
  
  console.log('Environment variables:', envVars);
  
  return NextResponse.json({
    success: true,
    message: 'Simple environment variables test',
    envVars
  });
} 