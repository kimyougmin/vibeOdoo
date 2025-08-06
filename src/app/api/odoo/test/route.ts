import { NextResponse } from 'next/server';
import xmlrpc from 'xmlrpc';
import { getOdooConfig } from '@/lib/env';

export async function GET() {
  try {
    // 환경변수에서 Odoo 설정 가져오기
    const { url: ODOO_URL, database: DB, username: USER, password: PASS } = getOdooConfig();

    console.log('XML-RPC 연결 테스트 시작');
    
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

    // 2. 사용자 정보 확인
    const models = xmlrpc.createClient({ url: `${ODOO_URL}/xmlrpc/2/object` });
    const userInfo = await new Promise<any[]>((resolve, reject) => {
      models.methodCall(
        'execute_kw',
        [
          DB, uid, PASS,
          'res.users', 'read',
          [[uid], ['id', 'name', 'login', 'email']]
        ],
        (err: any, value: any) => {
          if (err) {
            console.error('사용자 정보 조회 실패:', err);
            reject(err);
          } else {
            console.log('사용자 정보 조회 성공:', value);
            resolve(value);
          }
        }
      );
    });

    return NextResponse.json({ 
      success: true, 
      uid: uid, 
      userInfo: userInfo 
    });
  } catch (error) {
    console.error('XML-RPC 테스트 에러:', error);
    return NextResponse.json(
      { error: 'XML-RPC 테스트 실패', details: (error as Error).message }, 
      { status: 500 }
    );
  }
} 