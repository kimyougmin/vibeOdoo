import { NextResponse } from 'next/server';
import xmlrpc from 'xmlrpc';
import { getOdooConfig } from '@/lib/env';

export async function GET() {
  try {
    // 환경변수에서 Odoo 설정 가져오기
    const { url: ODOO_URL, database: DB, username: USER, password: PASS } = getOdooConfig();

    console.log('XML-RPC 통계 데이터 조회 시작');
    
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

    // 1. 총 직원 수 조회
    const totalEmployees = await new Promise<number>((resolve, reject) => {
      objectClient.methodCall(
        'execute',
        [DB, uid, PASS, 'hr.employee', 'search_count', []],
        (error, value) => {
          if (error) {
            console.error('직원 수 조회 실패:', error);
            reject(error);
          } else {
            console.log('총 직원 수:', value);
            resolve(value);
          }
        }
      );
    });

    // 2. 총 부서 수 조회
    const totalDepartments = await new Promise<number>((resolve, reject) => {
      objectClient.methodCall(
        'execute',
        [DB, uid, PASS, 'hr.department', 'search_count', []],
        (error, value) => {
          if (error) {
            console.error('부서 수 조회 실패:', error);
            reject(error);
          } else {
            console.log('총 부서 수:', value);
            resolve(value);
          }
        }
      );
    });

    // 3. 오늘 출근한 직원 수 조회
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    
    const todayAttendances = await new Promise<any[]>((resolve, reject) => {
      objectClient.methodCall(
        'execute',
        [DB, uid, PASS, 'hr.attendance', 'search_read', 
         [['check_in', '>=', todayStr + ' 00:00:00']], 
         ['employee_id']],
        (error, value) => {
          if (error) {
            console.error('오늘 출근 기록 조회 실패:', error);
            resolve([]); // 에러 시 빈 배열 반환
          } else {
            console.log('오늘 출근 기록:', value);
            resolve(value);
          }
        }
      );
    });

    // 4. 오늘 연차 사용한 직원 수 조회
    const todayLeaves = await new Promise<any[]>((resolve, reject) => {
      objectClient.methodCall(
        'execute',
        [DB, uid, PASS, 'hr.leave', 'search_read', 
         [['date_from', '>=', todayStr + ' 00:00:00', 'date_to', '<=', todayStr + ' 23:59:59', 'state', '=', 'validate']], 
         ['employee_id']],
        (error, value) => {
          if (error) {
            console.error('오늘 연차 기록 조회 실패:', error);
            resolve([]); // 에러 시 빈 배열 반환
          } else {
            console.log('오늘 연차 기록:', value);
            resolve(value);
          }
        }
      );
    });

    // 중복 제거하여 실제 출근/연차 직원 수 계산
    const uniqueTodayAttendances = new Set(todayAttendances.map(att => att.employee_id[0])).size;
    const uniqueTodayLeaves = new Set(todayLeaves.map(leave => leave.employee_id[0])).size;

    const stats = {
      totalEmployees,
      totalDepartments,
      todayAttendances: uniqueTodayAttendances,
      todayLeaves: uniqueTodayLeaves
    };

    console.log('통계 데이터:', stats);

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('XML-RPC 통계 조회 에러:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '통계 데이터 조회 실패', 
        details: (error as Error).message 
      }, 
      { status: 500 }
    );
  }
} 