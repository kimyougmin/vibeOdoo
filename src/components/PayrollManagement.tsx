'use client';

import React, { useState, useEffect } from 'react';
import { getOdooAPI } from '@/lib/odoo-api';

interface PayrollData {
  id: number;
  name: string;
  employee_id: [number, string];
  wage: number;
  date_start: string;
  date_end: string | null;
  state: string;
}

interface PayrollFormData {
  name: string;
  employee_id: number;
  wage: number;
  date_start: string;
  date_end: string | null;
}

export default function PayrollManagement() {
  const [payrolls, setPayrolls] = useState<PayrollData[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<PayrollData | null>(null);
  const [formData, setFormData] = useState<PayrollFormData>({
    name: '',
    employee_id: 0,
    wage: 0,
    date_start: '',
    date_end: null
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

      const [payrollList, employeeList] = await Promise.all([
        api.getPayrolls(),
        api.getEmployees()
      ]);

      setPayrolls(payrollList);
      setEmployees(employeeList);
    } catch (err) {
      setError('급여 정보를 불러오는데 실패했습니다.');
      console.error('급여 정보 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPayroll(null);
    setFormData({
      name: '',
      employee_id: 0,
      wage: 0,
      date_start: '',
      date_end: null
    });
    setShowForm(true);
  };

  const handleEdit = (payroll: PayrollData) => {
    setEditingPayroll(payroll);
    setFormData({
      name: payroll.name,
      employee_id: payroll.employee_id[0],
      wage: payroll.wage,
      date_start: payroll.date_start,
      date_end: payroll.date_end
    });
    setShowForm(true);
  };

  const handleDelete = async (payrollId: number) => {
    if (!confirm('정말로 이 급여 계약을 삭제하시겠습니까?')) return;

    try {
      const api = getOdooAPI();
      if (!api) return;

      await api.deletePayroll(payrollId);
      await loadData(); // 목록 새로고침
    } catch (err) {
      setError('급여 계약 삭제에 실패했습니다.');
      console.error('급여 계약 삭제 실패:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const api = getOdooAPI();
      if (!api) return;

      if (editingPayroll) {
        await api.updatePayroll(editingPayroll.id, formData);
      } else {
        await api.createPayroll(formData);
      }

      setShowForm(false);
      await loadData(); // 목록 새로고침
    } catch (err) {
      setError(editingPayroll ? '급여 계약 수정에 실패했습니다.' : '급여 계약 생성에 실패했습니다.');
      console.error('급여 계약 저장 실패:', err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPayroll(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'close':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (state: string) => {
    switch (state) {
      case 'open':
        return '활성';
      case 'close':
        return '종료';
      default:
        return state;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">급여 정보를 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">급여 관리</h2>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          새 급여 계약 추가
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

      {/* 급여 목록 */}
      <div className="bg-white shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  직원명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  계약명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  급여
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  시작일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  종료일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payrolls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    등록된 급여 정보가 없습니다.
                  </td>
                </tr>
              ) : (
                payrolls.map((payroll) => (
                  <tr key={payroll.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payroll.employee_id[1]}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {payroll.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(payroll.wage)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(payroll.date_start)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {payroll.date_end ? formatDate(payroll.date_end) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payroll.state)}`}>
                        {getStatusText(payroll.state)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(payroll)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(payroll.id)}
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

      {/* 급여 계약 추가/수정 폼 */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingPayroll ? '급여 계약 수정' : '새 급여 계약 추가'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">계약명</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">직원</label>
                  <select
                    value={formData.employee_id || ''}
                    onChange={(e) => setFormData({...formData, employee_id: parseInt(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">직원 선택</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">급여</label>
                  <input
                    type="number"
                    value={formData.wage}
                    onChange={(e) => setFormData({...formData, wage: parseInt(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">시작일</label>
                  <input
                    type="date"
                    value={formData.date_start}
                    onChange={(e) => setFormData({...formData, date_start: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">종료일</label>
                  <input
                    type="date"
                    value={formData.date_end || ''}
                    onChange={(e) => setFormData({...formData, date_end: e.target.value || null})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
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
                    {editingPayroll ? '수정' : '추가'}
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