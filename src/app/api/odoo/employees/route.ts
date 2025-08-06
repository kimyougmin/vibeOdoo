import { NextResponse } from 'next/server';
import xmlrpc from 'xmlrpc';
import { getOdooConfig } from '@/lib/env';

export async function GET() {
  try {
    // 환경변수에서 Odoo 설정 가져오기
    const { url: ODOO_URL, database: DB, username: USER, password: PASS } = getOdooConfig();

    console.log('XML-RPC 직원 조회 시작');
    
    // 1. 인증
    const common = xmlrpc.createClient({ url: `${ODOO_URL}/xmlrpc/2/common` });
    const uid: number = await new Promise<number>((resolve, reject) => {
      common.methodCall('authenticate', [DB, USER, PASS, {}], (err: any, value: any) => {
        if (err) {
          console.error('인증 실패:', err);
          reject(err);
        } else {
          console.log('인증 성공, UID:', value);
          resolve(value);
        }
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
          [[], ['id', 'name', 'work_email', 'work_phone', 'job_title', 'department_id', 'work_location_id', 'work_contact_id', 'create_date', 'write_date']]
        ],
        (err: any, value: any) => {
          if (err) {
            console.error('직원 조회 실패:', err);
            reject(err);
          } else {
            console.log('직원 조회 성공:', value);
            resolve(value);
          }
        }
      );
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error('XML-RPC 에러:', error);
    return NextResponse.json(
      { error: '직원 데이터 조회 실패', details: (error as Error).message }, 
      { status: 500 }
    );
  }
} 