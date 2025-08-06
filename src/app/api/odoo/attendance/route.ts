import { NextResponse } from 'next/server';
import xmlrpc from 'xmlrpc';
import { getOdooConfig } from '@/lib/env';

export async function GET(request: Request) {
  try {
    // 환경변수에서 Odoo 설정 가져오기
    const { url: ODOO_URL, database: DB, username: USER, password: PASS } = getOdooConfig();

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    console.log('XML-RPC 근태 정보 조회 시작');
    
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

    // 2. 근태 정보 조회
    const models = xmlrpc.createClient({ url: `${ODOO_URL}/xmlrpc/2/object` });
    const domain = employeeId ? [['employee_id', '=', parseInt(employeeId)]] : [];
    
    const attendances = await new Promise<any[]>((resolve, reject) => {
      models.methodCall(
        'execute_kw',
        [
          DB, uid, PASS,
          'hr.attendance', 'search_read',
          [domain, ['id', 'employee_id', 'check_in', 'check_out', 'worked_hours'], null, limit]
        ],
        (err: any, value: any) => {
          if (err) {
            console.error('근태 정보 조회 실패:', err);
            reject(err);
          } else {
            console.log('근태 정보 조회 성공:', value);
            resolve(value || []);
          }
        }
      );
    });

    return NextResponse.json(attendances);
  } catch (error) {
    console.error('XML-RPC 에러:', error);
    return NextResponse.json(
      { error: '근태 정보 조회 실패', details: (error as Error).message }, 
      { status: 500 }
    );
  }
} 