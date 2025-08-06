'use client';

import React, { useState, useEffect } from 'react';
import { getOdooAPI } from '@/lib/odoo-api';
import { Department } from '@/types/odoo';

interface DepartmentFormData {
  name: string;
  parent_id: number | null;
  manager_id: number | null;
}

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: '',
    parent_id: null,
    manager_id: null
  });

  useEffect(() => {
    loadData();
  }, []);

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
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
      console.error('데이터 로드 실패:', err);
      setDepartments([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingDepartment(null);
    setFormData({
      name: '',
      parent_id: null,
      manager_id: null
    });
    setShowForm(true);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name || '',
      parent_id: department.parent_id?.[0] || null,
      manager_id: department.manager_id?.[0] || null
    });
    setShowForm(true);
  };

  const handleDelete = async (departmentId: number) => {
    if (!confirm('정말로 이 부서를 삭제하시겠습니까?')) return;

    try {
      const api = getOdooAPI();
      if (!api) return;

      await api.deleteDepartment(departmentId);
      await loadData(); // 목록 새로고침
    } catch (err) {
      setError('부서 삭제에 실패했습니다.');
      console.error('부서 삭제 실패:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const api = getOdooAPI();
      if (!api) return;

      if (editingDepartment) {
        await api.updateDepartment(editingDepartment.id, formData);
      } else {
        await api.createDepartment(formData);
      }

      setShowForm(false);
      await loadData(); // 목록 새로고침
    } catch (err) {
      setError(editingDepartment ? '부서 수정에 실패했습니다.' : '부서 생성에 실패했습니다.');
      console.error('부서 저장 실패:', err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDepartment(null);
  };

  const getEmployeeCount = (departmentId: number) => {
    return employees.filter(emp => emp.department_id?.[0] === departmentId).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">데이터를 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">부서 관리</h2>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          새 부서 추가
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            닫기
          </button>
        </div>
      )}

      {/* 부서 목록 */}
      <div className="bg-white shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  부서명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상위부서
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  부서장
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  인원수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    등록된 부서가 없습니다.
                  </td>
                </tr>
              ) : (
                departments.map((department) => (
                  <tr key={department.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {department.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {department.parent_id?.[1] || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {department.manager_id?.[1] || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getEmployeeCount(department.id)}명
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(department)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(department.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 부서 추가/수정 폼 */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingDepartment ? '부서 수정' : '새 부서 추가'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">부서명</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">상위부서</label>
                  <select
                    value={formData.parent_id || ''}
                    onChange={(e) => setFormData({...formData, parent_id: e.target.value ? parseInt(e.target.value) : null})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">상위부서 없음</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">부서장</label>
                  <select
                    value={formData.manager_id || ''}
                    onChange={(e) => setFormData({...formData, manager_id: e.target.value ? parseInt(e.target.value) : null})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">부서장 없음</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingDepartment ? '수정' : '추가'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 