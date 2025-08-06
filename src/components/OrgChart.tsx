'use client';

import React, { useState, useEffect } from 'react';
import { getOdooAPI } from '@/lib/odoo-api';
import { Department } from '@/types/odoo';

interface OrgChartProps {
  onDepartmentSelect?: (department: Department) => void;
}

export default function OrgChart({ onDepartmentSelect }: OrgChartProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const api = getOdooAPI();
      if (!api) {
        setError('Odoo API가 초기화되지 않았습니다.');
        return;
      }

      const departmentList = await api.getDepartments();
      setDepartments(departmentList);
    } catch (err) {
      setError('부서 목록을 불러오는데 실패했습니다.');
      console.error('부서 목록 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentClick = (department: Department) => {
    onDepartmentSelect?.(department);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">조직도를 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadDepartments}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          조직도 ({departments.length}개 부서)
        </h3>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {departments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              등록된 부서가 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((department) => (
                <div
                  key={department.id}
                  onClick={() => handleDepartmentClick(department)}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {department.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {department.employee_count || 0}명
                      </p>
                    </div>
                  </div>
                  
                  {department.parent_id && (
                    <div className="mt-2 text-xs text-gray-400">
                      상위부서: {department.parent_id[1]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 