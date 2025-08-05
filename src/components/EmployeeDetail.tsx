'use client';

import React, { useState, useEffect } from 'react';
import { Employee, Attendance, Payroll } from '@/types/odoo';
import { getOdooAPI } from '@/lib/odoo-api';

interface EmployeeDetailProps {
  employeeId: number;
  onBack?: () => void;
}

export default function EmployeeDetail({ employeeId, onBack }: EmployeeDetailProps) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'attendance' | 'payroll'>('info');

  useEffect(() => {
    loadEmployeeData();
  }, [employeeId]);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);
      const api = getOdooAPI();
      if (!api) {
        setError('Odoo API가 초기화되지 않았습니다.');
        return;
      }

      const [employeeData, attendanceData, payrollData] = await Promise.all([
        api.getEmployee(employeeId),
        api.getAttendances(employeeId, 10),
        api.getPayrolls(employeeId, 5)
      ]);

      setEmployee(employeeData);
      setAttendances(attendanceData);
      setPayrolls(payrollData);
    } catch (err) {
      setError('직원 정보를 불러오는데 실패했습니다.');
      console.error('직원 데이터 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">직원 정보를 불러오는 중...</span>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error || '직원 정보를 찾을 수 없습니다.'}</p>
        <button
          onClick={onBack}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            수정
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            삭제
          </button>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'info', label: '기본 정보' },
            { id: 'attendance', label: '근태 기록' },
            { id: 'payroll', label: '급여 정보' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="mt-6">
        {activeTab === 'info' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">개인 정보</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">이름</dt>
                    <dd className="text-sm text-gray-900">{employee.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">직무</dt>
                    <dd className="text-sm text-gray-900">{employee.job_title || '미지정'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">부서</dt>
                    <dd className="text-sm text-gray-900">{employee.department_id?.[1] || '미지정'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">이메일</dt>
                    <dd className="text-sm text-gray-900">{employee.work_email || '없음'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">전화번호</dt>
                    <dd className="text-sm text-gray-900">{employee.work_phone || '없음'}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">시스템 정보</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">직원 ID</dt>
                    <dd className="text-sm text-gray-900">{employee.id}</dd>
                  </div>
                  {employee.create_date && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">등록일</dt>
                      <dd className="text-sm text-gray-900">{formatDate(employee.create_date)}</dd>
                    </div>
                  )}
                  {employee.write_date && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">수정일</dt>
                      <dd className="text-sm text-gray-900">{formatDate(employee.write_date)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">근태 기록</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {attendances.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  근태 기록이 없습니다.
                </div>
              ) : (
                attendances.map((attendance) => (
                  <div key={attendance.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(attendance.check_in)}
                        </p>
                        <p className="text-sm text-gray-500">
                          입사: {formatTime(attendance.check_in)}
                          {attendance.check_out && ` | 퇴사: ${formatTime(attendance.check_out)}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {attendance.worked_hours?.toFixed(2) || '0'}시간
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'payroll' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">급여 정보</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {payrolls.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  급여 정보가 없습니다.
                </div>
              ) : (
                payrolls.map((payroll) => (
                  <div key={payroll.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          급여명세서 #{payroll.number}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(payroll.date_from)} ~ {formatDate(payroll.date_to)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          payroll.state === 'done' 
                            ? 'bg-green-100 text-green-800'
                            : payroll.state === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {payroll.state === 'done' ? '완료' : 
                           payroll.state === 'draft' ? '임시저장' : payroll.state}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 