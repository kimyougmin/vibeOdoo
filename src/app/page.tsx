'use client';

import { useState, useEffect } from 'react';
import { createOdooAPI } from '@/lib/odoo-api';
import EmployeeList from '@/components/EmployeeList';
import EmployeeDetail from '@/components/EmployeeDetail';
import DepartmentList from '@/components/DepartmentList';
import Dashboard from '@/components/Dashboard';
import OrgChart from '@/components/OrgChart';
import PayrollManagement from '@/components/PayrollManagement';
import EmployeeManagement from '@/components/EmployeeManagement';
import DepartmentManagement from '@/components/DepartmentManagement';
import OrgChartManagement from '@/components/OrgChartManagement';
import { Employee, Department } from '@/types/odoo';

// 클라이언트 사이드에서 환경변수 가져오기
function getClientEnvVars() {
  const url = process.env.NEXT_PUBLIC_ODOO_URL;
  const database = process.env.NEXT_PUBLIC_ODOO_DATABASE;
  const username = process.env.NEXT_PUBLIC_ODOO_USERNAME;
  const password = process.env.NEXT_PUBLIC_ODOO_PASSWORD;

  if (!url || !database || !username || !password) {
    throw new Error('환경변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.');
  }

  return {
    url,
    database,
    username,
    password,
  }
}

export default function Home() {
  const [isApiInitialized, setIsApiInitialized] = useState(false);
  const [viewMode, setViewMode] = useState<'dashboard' | 'employees' | 'departments' | 'org-chart' | 'payroll' | 'employee-detail'>('dashboard');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeOdooAPI();
  }, []);

  const initializeOdooAPI = async () => {
    try {
      // 클라이언트 사이드에서 환경변수 가져오기
      const auth = getClientEnvVars();

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
    setViewMode('dashboard');
  };

  const handleViewModeChange = (mode: 'dashboard' | 'employees' | 'departments' | 'org-chart' | 'payroll' | 'employee-detail') => {
    setViewMode(mode);
    if (mode === 'employee-detail' && selectedEmployee) {
      // 이미 선택된 직원이 있으면 그대로 유지
    } else {
      setSelectedEmployee(null);
    }
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
                  onClick={() => handleViewModeChange('dashboard')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    viewMode === 'dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  대시보드
                </button>
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
                <button
                  onClick={() => handleViewModeChange('org-chart')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    viewMode === 'org-chart'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  조직도
                </button>
                <button
                  onClick={() => handleViewModeChange('payroll')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    viewMode === 'payroll'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  급여 관리
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
            <DepartmentManagement />
          ) : viewMode === 'org-chart' ? (
            <OrgChartManagement />
          ) : viewMode === 'payroll' ? (
            <PayrollManagement />
          ) : viewMode === 'employees' ? (
            <EmployeeManagement />
          ) : (
            <div className="space-y-6">
              {/* 통계 대시보드 */}
              <Dashboard />
              
              {/* 직원 목록 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">직원 목록</h2>
                </div>
                <div className="p-6">
                  <EmployeeList onEmployeeSelect={handleEmployeeSelect} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
