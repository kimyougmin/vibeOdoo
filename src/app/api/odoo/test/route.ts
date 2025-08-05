import { NextResponse } from 'next/server';
import xmlrpc from 'xmlrpc';

const ODOO_URL = process.env.NEXT_PUBLIC_ODOO_URL;
const DB = process.env.ODOO_DATABASE;
const USER = process.env.ODOO_USERNAME;
const PASS = process.env.ODOO_PASSWORD;

export async function GET() {
  try {
    // 환경변수 검증
    if (!ODOO_URL || !DB || !USER || !PASS) {
      return NextResponse.json(
        { error: '환경변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.' }, 
        { status: 500 }
      );
    }

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