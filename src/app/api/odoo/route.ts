import { NextRequest, NextResponse } from 'next/server';
import xmlrpc from 'xmlrpc';

const ODOO_URL = process.env.NEXT_PUBLIC_ODOO_URL || 'http://localhost:12000';
const DB = 'odoo-db';
const USER = 'dudals896@gmail.com';
const PASS = 'qwer1234!';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, data } = body;

    console.log('프록시 요청:', endpoint, data);

    const response = await fetch(`${ODOO_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('Odoo 응답 상태:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Odoo HTTP 에러:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Odoo 응답 데이터:', result);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Odoo API 프록시 에러:', error);
    return NextResponse.json(
      { error: 'Odoo API 요청 실패', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // 1. 인증
    const common = xmlrpc.createClient({ url: `${ODOO_URL}/xmlrpc/2/common` });
    const uid: number = await new Promise<number>((resolve, reject) => {
      common.methodCall('authenticate', [DB, USER, PASS, {}], (err: any, value: any) => {
        if (err) reject(err);
        else resolve(value);
      });
    });

    // 2. 직원 데이터 조회
    const models = xmlrpc.createClient({ url: `${ODOO_URL}/xmlrpc/2/object` });
    const employees = await new Promise<any[]>((resolve, reject) => {
      models.methodCall(
        'execute_kw',
        [
          DB, uid, PASS,
          'hr.employee', 'search_read',
          [[], ['id', 'name', 'email', 'phone', 'job_title', 'department_id', 'work_email', 'work_phone']]
        ],
        (err: any, value: any) => {
          if (err) reject(err);
          else resolve(value);
        }
      );
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error('XML-RPC 에러:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}