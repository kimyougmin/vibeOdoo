import { NextResponse } from 'next/server';
import xmlrpc from 'xmlrpc';
import { getOdooConfig } from '@/lib/env';
import { NextRequest } from 'next/server';

export async function GET() {
  try {
    // 환경변수에서 Odoo 설정 가져오기
    const { url: ODOO_URL, database: DB, username: USER, password: PASS } = getOdooConfig();

    console.log('XML-RPC 급여 조회 시작');
    
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

    // 급여 정보 조회 (hr.contract 모델 사용)
    const payrolls = await new Promise<any[]>((resolve, reject) => {
      objectClient.methodCall(
        'execute',
        [DB, uid, PASS, 'hr.contract', 'search_read', 
         [['state', '=', 'open']], 
         ['id', 'name', 'employee_id', 'wage', 'date_start', 'date_end', 'state']],
        (error, value) => {
          if (error) {
            console.error('급여 조회 실패:', error);
            resolve([]); // 에러 시 빈 배열 반환
          } else {
            console.log('급여 조회 성공:', value);
            resolve(value);
          }
        }
      );
    });

    return NextResponse.json({
      success: true,
      data: payrolls
    });

  } catch (error) {
    console.error('XML-RPC 급여 조회 에러:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '급여 데이터 조회 실패', 
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

    console.log('XML-RPC 급여 계약 생성 시작:', data);
    
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

    // 급여 계약 생성
    const result = await new Promise<number>((resolve, reject) => {
      objectClient.methodCall(
        'execute',
        [DB, uid, PASS, 'hr.contract', 'create', [data]],
        (error, value) => {
          if (error) {
            console.error('급여 계약 생성 실패:', error);
            reject(error);
          } else {
            console.log('급여 계약 생성 성공:', value);
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
    console.error('XML-RPC 급여 계약 생성 에러:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '급여 계약 생성 실패', 
        details: (error as Error).message 
      }, 
      { status: 500 }
    );
  }
} 