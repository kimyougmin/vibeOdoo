import { NextRequest, NextResponse } from 'next/server';
import xmlrpc from 'xmlrpc';
import { getOdooConfig } from '@/lib/env';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const departmentId = parseInt(params.id);
    const data = await request.json();
    
    // 환경변수에서 Odoo 설정 가져오기
    const { url: ODOO_URL, database: DB, username: USER, password: PASS } = getOdooConfig();

    console.log('XML-RPC 부서 수정 시작:', departmentId, data);
    
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

    // 부서 수정
    const result = await new Promise<boolean>((resolve, reject) => {
      objectClient.methodCall(
        'execute',
        [DB, uid, PASS, 'hr.department', 'write', [departmentId], data],
        (error, value) => {
          if (error) {
            console.error('부서 수정 실패:', error);
            reject(error);
          } else {
            console.log('부서 수정 성공:', value);
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
    console.error('XML-RPC 부서 수정 에러:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '부서 수정 실패', 
        details: (error as Error).message 
      }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const departmentId = parseInt(params.id);
    
    // 환경변수에서 Odoo 설정 가져오기
    const { url: ODOO_URL, database: DB, username: USER, password: PASS } = getOdooConfig();

    console.log('XML-RPC 부서 삭제 시작:', departmentId);
    
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

    // 부서 삭제
    const result = await new Promise<boolean>((resolve, reject) => {
      objectClient.methodCall(
        'execute',
        [DB, uid, PASS, 'hr.department', 'unlink', [departmentId]],
        (error, value) => {
          if (error) {
            console.error('부서 삭제 실패:', error);
            reject(error);
          } else {
            console.log('부서 삭제 성공:', value);
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
    console.error('XML-RPC 부서 삭제 에러:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '부서 삭제 실패', 
        details: (error as Error).message 
      }, 
      { status: 500 }
    );
  }
} 