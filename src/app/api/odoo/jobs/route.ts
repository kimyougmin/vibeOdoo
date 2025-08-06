import { NextResponse } from 'next/server';
import xmlrpc from 'xmlrpc';
import { getOdooConfig } from '@/lib/env';

export async function GET() {
  try {
    // 환경변수에서 Odoo 설정 가져오기
    const { url: ODOO_URL, database: DB, username: USER, password: PASS } = getOdooConfig();

    console.log('XML-RPC 직무 조회 시작');
    
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

    // 직무 목록 조회
    const jobs = await new Promise<any[]>((resolve, reject) => {
      objectClient.methodCall(
        'execute',
        [DB, uid, PASS, 'hr.job', 'search_read', 
         [['active', '=', true]], 
         ['id', 'name', 'description']],
        (error, value) => {
          if (error) {
            console.error('직무 조회 실패:', error);
            resolve([]); // 에러 시 빈 배열 반환
          } else {
            console.log('직무 조회 성공:', value);
            resolve(value);
          }
        }
      );
    });

    return NextResponse.json({
      success: true,
      data: jobs
    });

  } catch (error) {
    console.error('XML-RPC 직무 조회 에러:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '직무 데이터 조회 실패', 
        details: (error as Error).message 
      }, 
      { status: 500 }
    );
  }
} 