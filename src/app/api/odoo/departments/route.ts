import { NextResponse } from 'next/server';
import xmlrpc from 'xmlrpc';

const ODOO_URL = process.env.NEXT_PUBLIC_ODOO_URL || 'http://localhost:12000';
const DB = 'odoo-db';
const USER = 'dudals896@gmail.com';
const PASS = 'qwer1234!';

export async function GET() {
  try {
    console.log('XML-RPC 부서 조회 시작');
    
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

    // 2. 부서 데이터 조회
    const models = xmlrpc.createClient({ url: `${ODOO_URL}/xmlrpc/2/object` });
    const departments = await new Promise<any[]>((resolve, reject) => {
      models.methodCall(
        'execute_kw',
        [
          DB, uid, PASS,
          'hr.department', 'search_read',
          [[], ['id', 'name', 'complete_name', 'parent_id', 'manager_id', 'member_ids']]
        ],
        (err: any, value: any) => {
          if (err) {
            console.error('부서 조회 실패:', err);
            reject(err);
          } else {
            console.log('부서 조회 성공:', value);
            resolve(value || []);
          }
        }
      );
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error('XML-RPC 에러:', error);
    return NextResponse.json(
      { error: '부서 데이터 조회 실패', details: (error as Error).message }, 
      { status: 500 }
    );
  }
} 