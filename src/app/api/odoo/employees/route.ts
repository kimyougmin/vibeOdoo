import { NextRequest, NextResponse } from 'next/server';
import xmlrpc from 'xmlrpc';
import { getOdooConfig } from '@/lib/env';

export async function GET() {
  try {
    // 환경변수에서 Odoo 설정 가져오기
    const { url: ODOO_URL, database: DB, username: USER, password: PASS } = getOdooConfig();

    console.log('XML-RPC 직원 조회 시작');
    
    // XML-RPC 클라이언트 생성
    const client = xmlrpc.createClient({ url: `${ODOO_URL}/xmlrpc/2/common` });

    // 인증
    const uid = await new Promise<number>((resolve, reject) => {
      client.methodCall('authenticate', [DB, USER, PASS, {}], (error, value) => {
        if (error) {
          console.error('인증 실패:', error);
          reject(error);
        } else {
          console.log('인증 성공, UID:', value);
          resolve(value);
        }
      });
    });

    // 직원 데이터 조회
    const objectClient = xmlrpc.createClient({ url: `${ODOO_URL}/xmlrpc/2/object` });
    
    const employees = await new Promise<any[]>((resolve, reject) => {
      objectClient.methodCall(
        'execute',
        [DB, uid, PASS, 'hr.employee', 'search_read', [], ['id', 'name', 'work_email', 'work_phone', 'job_title', 'department_id', 'work_location_id']],
        (error, value) => {
          if (error) {
            console.error('직원 조회 실패:', error);
            reject(error);
          } else {
            console.log('직원 조회 성공:', value);
            resolve(value);
          }
        }
      );
    });

    return NextResponse.json({
      success: true,
      data: employees
    });

  } catch (error) {
    console.error('XML-RPC 에러:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '직원 데이터 조회 실패', 
        details: (error as Error).message 
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 환경변수에서 Odoo 설정 가져오기
    const { url: ODOO_URL, database: DB, username: USER, password: PASS } = getOdooConfig();

    console.log('XML-RPC 직원 생성 시작:', data);
    
    // XML-RPC 클라이언트 생성
    const client = xmlrpc.createClient({ url: `${ODOO_URL}/xmlrpc/2/common` });

    // 인증
    const uid = await new Promise<number>((resolve, reject) => {
      client.methodCall('authenticate', [DB, USER, PASS, {}], (error, value) => {
        if (error) {
          console.error('인증 실패:', error);
          reject(error);
        } else {
          console.log('인증 성공, UID:', value);
          resolve(value);
        }
      });
    });

    // Object 클라이언트 생성
    const objectClient = xmlrpc.createClient({ url: `${ODOO_URL}/xmlrpc/2/object` });

    // 직원 생성
    const result = await new Promise<number>((resolve, reject) => {
      objectClient.methodCall(
        'execute',
        [DB, uid, PASS, 'hr.employee', 'create', [data]],
        (error, value) => {
          if (error) {
            console.error('직원 생성 실패:', error);
            reject(error);
          } else {
            console.log('직원 생성 성공:', value);
            resolve(value);
          }
        }
      );
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('XML-RPC 직원 생성 에러:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '직원 생성 실패', 
        details: (error as Error).message 
      }, 
      { status: 500 }
    );
  }
} 