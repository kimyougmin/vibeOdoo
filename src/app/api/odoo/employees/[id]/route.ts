import { NextResponse } from 'next/server';
import xmlrpc from 'xmlrpc';

const ODOO_URL = process.env.NEXT_PUBLIC_ODOO_URL || 'http://localhost:12000';
const DB = process.env.ODOO_DATABASE || 'odoo-db';
const USER = process.env.ODOO_USERNAME || 'dudals896@gmail.com';
const PASS = process.env.ODOO_PASSWORD || 'qwer1234!';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = parseInt(params.id);
    console.log('XML-RPC 직원 상세 조회 시작:', employeeId);
    
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

    // 2. 직원 상세 정보 조회
    const models = xmlrpc.createClient({ url: `${ODOO_URL}/xmlrpc/2/object` });
    const employee = await new Promise<any>((resolve, reject) => {
      models.methodCall(
        'execute_kw',
        [
          DB, uid, PASS,
          'hr.employee', 'read',
          [[employeeId], ['id', 'name', 'work_email', 'work_phone', 'job_title', 'department_id', 'work_location_id', 'work_contact_id', 'create_date', 'write_date']]
        ],
        (err: any, value: any) => {
          if (err) {
            console.error('직원 상세 조회 실패:', err);
            reject(err);
          } else {
            console.log('직원 상세 조회 성공:', value);
            resolve(value?.[0] || null);
          }
        }
      );
    });

    if (!employee) {
      return NextResponse.json(
        { error: '직원을 찾을 수 없습니다.' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('XML-RPC 에러:', error);
    return NextResponse.json(
      { error: '직원 상세 정보 조회 실패', details: (error as Error).message }, 
      { status: 500 }
    );
  }
} 