'use client';

import React, { useState, useEffect } from 'react';
import { getOdooAPI } from '@/lib/odoo-api';
import { Department, Employee } from '@/types/odoo';

interface OrgStats {
  totalEmployees: number;
  maleEmployees: number;
  femaleEmployees: number;
  avgSalary: number;
  departments: Department[];
}

interface DepartmentDetail {
  id: number;
  name: string;
  employees: Employee[];
  employeeCount: number;
}

const OrgChartManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<OrgStats>({
    totalEmployees: 0,
    maleEmployees: 0,
    femaleEmployees: 0,
    avgSalary: 0,
    departments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // CRUD 상태 관리
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [departmentDetail, setDepartmentDetail] = useState<DepartmentDetail | null>(null);
  
  // 폼 상태
  const [formData, setFormData] = useState({
    name: '',
    complete_name: '',
    manager_id: null as number | null,
    parent_id: null as number | null
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const api = getOdooAPI();
      if (!api) {
        setError('Odoo API가 초기화되지 않았습니다.');
        return;
      }

      const [departmentList, employeeList] = await Promise.all([
        api.getDepartments(),
        api.getEmployees()
      ]);

      console.log('부서 목록:', departmentList);
      console.log('직원 목록:', employeeList);

      // 데이터가 배열인지 확인
      if (Array.isArray(departmentList)) {
        setDepartments(departmentList);
      } else {
        console.error('부서 데이터가 배열이 아닙니다:', departmentList);
        setDepartments([]);
      }

      if (Array.isArray(employeeList)) {
        setEmployees(employeeList);
      } else {
        console.error('직원 데이터가 배열이 아닙니다:', employeeList);
        setEmployees([]);
      }

      // 통계 계산
      const totalEmployees = Array.isArray(employeeList) ? employeeList.length : 0;
      const maleEmployees = Array.isArray(employeeList) ? employeeList.filter(emp => emp.gender === 'male').length : 0;
      const femaleEmployees = Array.isArray(employeeList) ? employeeList.filter(emp => emp.gender === 'female').length : 0;
      
      // 평균 급여 계산 (급여 정보가 있는 경우)
      const salaries = Array.isArray(employeeList) ? employeeList
        .filter(emp => emp.contract_ids && emp.contract_ids.length > 0)
        .map(emp => emp.contract_ids[0]?.wage || 0) : [];
      const avgSalary = salaries.length > 0 ? salaries.reduce((a, b) => a + b, 0) / salaries.length : 0;

      setStats({
        totalEmployees,
        maleEmployees,
        femaleEmployees,
        avgSalary,
        departments: Array.isArray(departmentList) ? departmentList : []
      });
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
      console.error('데이터 로드 실패:', err);
      setDepartments([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 부서 생성
  const handleCreateDepartment = async () => {
    try {
      const api = getOdooAPI();
      if (!api) {
        setError('Odoo API가 초기화되지 않았습니다.');
        return;
      }

      const success = await api.createDepartment(formData);
      if (success) {
        setShowCreateModal(false);
        setFormData({ name: '', complete_name: '', manager_id: null, parent_id: null });
        await loadData(); // 데이터 새로고침
      } else {
        setError('부서 생성에 실패했습니다.');
      }
    } catch (err) {
      setError('부서 생성 중 오류가 발생했습니다.');
      console.error('부서 생성 실패:', err);
    }
  };

  // 부서 수정
  const handleUpdateDepartment = async () => {
    if (!selectedDepartment) return;
    
    try {
      const api = getOdooAPI();
      if (!api) {
        setError('Odoo API가 초기화되지 않았습니다.');
        return;
      }

      const success = await api.updateDepartment(selectedDepartment.id, formData);
      if (success) {
        setShowEditModal(false);
        setSelectedDepartment(null);
        setFormData({ name: '', complete_name: '', manager_id: null, parent_id: null });
        await loadData(); // 데이터 새로고침
      } else {
        setError('부서 수정에 실패했습니다.');
      }
    } catch (err) {
      setError('부서 수정 중 오류가 발생했습니다.');
      console.error('부서 수정 실패:', err);
    }
  };

  // 부서 삭제
  const handleDeleteDepartment = async (departmentId: number) => {
    if (!confirm('정말로 이 부서를 삭제하시겠습니까?')) return;
    
    try {
      const api = getOdooAPI();
      if (!api) {
        setError('Odoo API가 초기화되지 않았습니다.');
        return;
      }

      const success = await api.deleteDepartment(departmentId);
      if (success) {
        await loadData(); // 데이터 새로고침
      } else {
        setError('부서 삭제에 실패했습니다.');
      }
    } catch (err) {
      setError('부서 삭제 중 오류가 발생했습니다.');
      console.error('부서 삭제 실패:', err);
    }
  };

  // 부서 상세 정보 조회
  const handleViewDepartmentDetail = (department: Department) => {
    const departmentEmployees = employees.filter(emp => 
      emp.department_id && emp.department_id[0] === department.id
    );
    
    setDepartmentDetail({
      id: department.id,
      name: department.name,
      employees: departmentEmployees,
      employeeCount: departmentEmployees.length
    });
    setShowDetailModal(true);
  };

  // 부서 편집 모달 열기
  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name || '',
      complete_name: department.complete_name || '',
      manager_id: department.manager_id ? department.manager_id[0] : null,
      parent_id: department.parent_id ? department.parent_id[0] : null
    });
    setShowEditModal(true);
  };

  // 부서 생성 모달 열기
  const handleCreateModalOpen = () => {
    setFormData({ name: '', complete_name: '', manager_id: null, parent_id: null });
    setShowCreateModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">오류 발생</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">총 직원 수</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">남성 직원</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.maleEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-pink-100 rounded-lg">
              <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">여성 직원</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.femaleEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">평균 급여</p>
              <p className="text-2xl font-semibold text-gray-900">${Math.round(stats.avgSalary).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 조직도 관리 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">조직도 관리</h2>
        <button
          onClick={handleCreateModalOpen}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          새 부서 생성
        </button>
      </div>

      {/* 조직도 트리 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">부서 구조</h3>
        </div>
        <div className="p-6">
          {departments.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">부서가 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">새 부서를 생성하여 조직도를 구성하세요.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {departments.map((department) => (
                <div key={department.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{department.name}</h4>
                        <p className="text-sm text-gray-500">
                          직원 수: {employees.filter(emp => emp.department_id && emp.department_id[0] === department.id).length}명
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDepartmentDetail(department)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        상세보기
                      </button>
                      <button
                        onClick={() => handleEditDepartment(department)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(department.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 부서 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">새 부서 생성</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">부서명</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">전체 경로</label>
                  <input
                    type="text"
                    value={formData.complete_name}
                    onChange={(e) => setFormData({ ...formData, complete_name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">상위 부서</label>
                  <select
                    value={formData.parent_id || ''}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? Number(e.target.value) : null })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">상위 부서 없음</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">부서장</label>
                  <select
                    value={formData.manager_id || ''}
                    onChange={(e) => setFormData({ ...formData, manager_id: e.target.value ? Number(e.target.value) : null })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">부서장 없음</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  취소
                </button>
                <button
                  onClick={handleCreateDepartment}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  생성
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 부서 수정 모달 */}
      {showEditModal && selectedDepartment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">부서 수정</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">부서명</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">전체 경로</label>
                  <input
                    type="text"
                    value={formData.complete_name}
                    onChange={(e) => setFormData({ ...formData, complete_name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">상위 부서</label>
                  <select
                    value={formData.parent_id || ''}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? Number(e.target.value) : null })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">상위 부서 없음</option>
                    {departments.filter(dept => dept.id !== selectedDepartment.id).map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">부서장</label>
                  <select
                    value={formData.manager_id || ''}
                    onChange={(e) => setFormData({ ...formData, manager_id: e.target.value ? Number(e.target.value) : null })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">부서장 없음</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  취소
                </button>
                <button
                  onClick={handleUpdateDepartment}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                >
                  수정
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 부서 상세 정보 모달 */}
      {showDetailModal && departmentDetail && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">{departmentDetail.name} 부서 상세정보</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-blue-800 font-medium">부서 정보</span>
                  </div>
                  <div className="mt-2 text-blue-700">
                    <p><strong>부서명:</strong> {departmentDetail.name}</p>
                    <p><strong>소속 직원 수:</strong> {departmentDetail.employeeCount}명</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">소속 직원 목록</h4>
                {departmentDetail.employees.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p>이 부서에 소속된 직원이 없습니다.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전화번호</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">직무</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {departmentDetail.employees.map((employee) => (
                          <tr key={employee.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{employee.work_email || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{employee.work_phone || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{employee.job_title || '-'}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgChartManagement; 