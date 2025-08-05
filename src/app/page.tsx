'use client';

import React, { useState, useEffect } from 'react';
import { Employee, Department } from '@/types/odoo';
import { createOdooAPI, getOdooAPI } from '@/lib/odoo-api';
import EmployeeList from '@/components/EmployeeList';
import EmployeeDetail from '@/components/EmployeeDetail';
import DepartmentList from '@/components/DepartmentList';

type ViewMode = 'employees' | 'departments' | 'employee-detail';

export default function Home() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('employees');
  const [isApiInitialized, setIsApiInitialized] = useState(false);

  useEffect(() => {
    initializeOdooAPI();
  }, []);

  const initializeOdooAPI = async () => {
    try {
      // Odoo API 초기화 (환경변수에서 가져옴)
      const auth = {
        url: process.env.NEXT_PUBLIC_ODOO_URL || 'http://localhost:12000',
        database: process.env.ODOO_DATABASE || 'odoo-db',
        username: process.env.ODOO_USERNAME || 'dudals896@gmail.com',
        password: process.env.ODOO_PASSWORD || 'qwer1234!',
      };

      const api = createOdooAPI(auth);
      const loginSuccess = await api.login();
      
      if (loginSuccess) {
        setIsApiInitialized(true);
        console.log('Odoo API 연결 성공');
      } else {
        console.error('Odoo API 로그인 실패');
      }
    } catch (error) {
      console.error('Odoo API 초기화 실패:', error);
    }
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setViewMode('employee-detail');
  };

  const handleDepartmentSelect = (department: Department) => {
    setSelectedDepartment(department);
    // 부서별 직원 필터링 기능은 나중에 구현
  };

  const handleBackToList = () => {
    setSelectedEmployee(null);
    setViewMode('employees');
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setSelectedEmployee(null);
    setSelectedDepartment(null);
  };

  if (!isApiInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Odoo API에 연결하는 중...</p>
          <p className="mt-2 text-sm text-gray-500">
            Odoo 서버가 실행 중인지 확인해주세요 ({process.env.NEXT_PUBLIC_ODOO_URL || 'http://localhost:12000'})
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  {process.env.NEXT_PUBLIC_APP_NAME || 'Odoo HR 관리 시스템'}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-4">
                <button
                  onClick={() => handleViewModeChange('employees')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    viewMode === 'employees'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  직원 관리
                </button>
                <button
                  onClick={() => handleViewModeChange('departments')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    viewMode === 'departments'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  부서 관리
                </button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {viewMode === 'employee-detail' && selectedEmployee ? (
            <EmployeeDetail
              employeeId={selectedEmployee.id}
              onBack={handleBackToList}
            />
          ) : viewMode === 'departments' ? (
            <DepartmentList onDepartmentSelect={handleDepartmentSelect} />
          ) : (
            <div className="space-y-6">
              {/* 통계 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            총 직원 수
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {/* 실제 데이터로 교체 필요 */}
                            2명
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            총 부서 수
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {/* 실제 데이터로 교체 필요 */}
                            1개
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            오늘 출근
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {/* 실제 데이터로 교체 필요 */}
                            1명
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            연차 사용
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {/* 실제 데이터로 교체 필요 */}
                            0명
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 직원 목록 */}
              <EmployeeList onEmployeeSelect={handleEmployeeSelect} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
