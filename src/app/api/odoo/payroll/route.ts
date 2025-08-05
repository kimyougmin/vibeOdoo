import { NextResponse } from 'next/server';
import xmlrpc from 'xmlrpc';

const ODOO_URL = process.env.NEXT_PUBLIC_ODOO_URL;
const DB = process.env.ODOO_DATABASE;
const USER = process.env.ODOO_USERNAME;
const PASS = process.env.ODOO_PASSWORD;

export async function GET(request: Request) {
  try {
    // 환경변수 검증
    if (!ODOO_URL || !DB || !USER || !PASS) {
      return NextResponse.json(
        { error: '환경변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.' }, 
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    console.log('XML-RPC 급여 정보 조회 시작');
    
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

    // 2. 급여 정보 조회
    const models = xmlrpc.createClient({ url: `${ODOO_URL}/xmlrpc/2/object` });
    const domain = employeeId ? [['employee_id', '=', parseInt(employeeId)]] : [];
    
    const payrolls = await new Promise<any[]>((resolve, reject) => {
      models.methodCall(
        'execute_kw',
        [
          DB, uid, PASS,
          'hr.payslip', 'search_read',
          [domain, ['id', 'employee_id', 'date_from', 'date_to', 'state', 'number'], null, limit]
        ],
        (err: any, value: any) => {
          if (err) {
            console.error('급여 정보 조회 실패:', err);
            reject(err);
          } else {
            console.log('급여 정보 조회 성공:', value);
            resolve(value || []);
          }
        }
      );
    });

    return NextResponse.json(payrolls);
  } catch (error) {
    console.error('XML-RPC 에러:', error);
    return NextResponse.json(
      { error: '급여 정보 조회 실패', details: (error as Error).message }, 
      { status: 500 }
    );
  }
} 