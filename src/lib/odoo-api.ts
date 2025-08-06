import axios from 'axios';
import { getEnvVar } from '@/lib/env';
import { 
  Employee, 
  Department, 
  Attendance, 
  Payroll,
  OdooRequestOptions,
  OdooError,
  Contract,
  Holiday
} from '@/types/odoo';

export interface OdooAuth {
  url: string;
  database: string;
  username: string;
  password: string;
}

export interface OdooResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class OdooAPI {
  private client: any;
  private auth: OdooAuth;

  constructor(auth: OdooAuth) {
    this.auth = auth;
    // Next.js API 라우트를 통해 프록시 접근
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api/odoo',
      timeout: process.env.NEXT_PUBLIC_API_TIMEOUT ? parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT) : 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // 응답 인터셉터
    this.client.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        console.error('API 요청 실패:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // 로그인 (프록시를 통한 접근)
  async login(): Promise<boolean> {
    try {
      console.log('Odoo 로그인 시도 (프록시)');
      
      const response = await this.client.post('', {
        endpoint: '/web/session/authenticate',
        data: {
          jsonrpc: '2.0',
          method: 'call',
          params: {
            db: this.auth.database,
            login: this.auth.username,
            password: this.auth.password,
          }
        }
      });

      console.log('로그인 응답:', response.data);

      // 응답에서 성공 여부 확인
      if (response.data.result && response.data.result.uid) {
        console.log('로그인 성공 - UID:', response.data.result.uid);
        return true;
      } else if (response.data.error) {
        console.error('로그인 실패 - 에러:', response.data.error);
        return false;
      } else {
        console.log('로그인 응답이 예상과 다름:', response.data);
        return false;
      }
    } catch (error) {
      console.error('Odoo 로그인 실패:', error);
      return false;
    }
  }

  // 직원 목록 조회 (XML-RPC 프록시를 통한 접근)
  async getEmployees(limit: number = 20, offset: number = 0): Promise<Employee[]> {
    try {
      console.log('직원 목록 조회 시작 (XML-RPC)');
      
      const response = await fetch('/api/odoo/employees');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('직원 목록 조회 결과:', result);
      
      // API 응답에서 data 필드를 추출
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      } else {
        console.error('직원 데이터가 올바르지 않습니다:', result);
        return [];
      }
    } catch (error) {
      console.error('직원 목록 조회 실패:', error);
      return [];
    }
  }

  // 직원 상세 정보 조회
  async getEmployee(employeeId: number): Promise<Employee | null> {
    try {
      console.log('직원 상세 정보 조회 시작:', employeeId);
      
      const response = await fetch(`/api/odoo/employees/${employeeId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('직원 상세 정보 조회 결과:', result);
      
      // API 응답에서 data 필드를 추출
      if (result.success && result.data) {
        return result.data;
      } else {
        console.error('직원 데이터가 올바르지 않습니다:', result);
        return null;
      }
    } catch (error) {
      console.error('직원 상세 정보 조회 실패:', error);
      return null;
    }
  }

  // 직원 생성
  async createEmployee(data: any): Promise<boolean> {
    try {
      console.log('직원 생성 시작:', data);
      
      const response = await fetch('/api/odoo/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('직원 생성 결과:', result);
      
      return result.success || false;
    } catch (error) {
      console.error('직원 생성 실패:', error);
      return false;
    }
  }

  // 직원 수정
  async updateEmployee(employeeId: number, data: any): Promise<boolean> {
    try {
      console.log('직원 수정 시작:', employeeId, data);
      
      const response = await fetch(`/api/odoo/employees/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('직원 수정 결과:', result);
      
      return result.success || false;
    } catch (error) {
      console.error('직원 수정 실패:', error);
      return false;
    }
  }

  // 직원 삭제
  async deleteEmployee(employeeId: number): Promise<boolean> {
    try {
      console.log('직원 삭제 시작:', employeeId);
      
      const response = await fetch(`/api/odoo/employees/${employeeId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('직원 삭제 결과:', result);
      
      return result.success || false;
    } catch (error) {
      console.error('직원 삭제 실패:', error);
      return false;
    }
  }

  // 부서 목록 조회
  async getDepartments(): Promise<Department[]> {
    try {
      console.log('부서 목록 조회 시작');
      
      const response = await fetch('/api/odoo/departments');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('부서 목록 조회 결과:', result);
      
      // API 응답에서 data 필드를 추출
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      } else {
        console.error('부서 데이터가 올바르지 않습니다:', result);
        return [];
      }
    } catch (error) {
      console.error('부서 목록 조회 실패:', error);
      return [];
    }
  }

  // 부서 생성
  async createDepartment(data: any): Promise<boolean> {
    try {
      console.log('부서 생성 시작:', data);
      
      const response = await fetch('/api/odoo/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('부서 생성 결과:', result);
      
      return result.success || false;
    } catch (error) {
      console.error('부서 생성 실패:', error);
      return false;
    }
  }

  // 부서 수정
  async updateDepartment(departmentId: number, data: any): Promise<boolean> {
    try {
      console.log('부서 수정 시작:', departmentId, data);
      
      const response = await fetch(`/api/odoo/departments/${departmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('부서 수정 결과:', result);
      
      return result.success || false;
    } catch (error) {
      console.error('부서 수정 실패:', error);
      return false;
    }
  }

  // 부서 삭제
  async deleteDepartment(departmentId: number): Promise<boolean> {
    try {
      console.log('부서 삭제 시작:', departmentId);
      
      const response = await fetch(`/api/odoo/departments/${departmentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('부서 삭제 결과:', result);
      
      return result.success || false;
    } catch (error) {
      console.error('부서 삭제 실패:', error);
      return false;
    }
  }

  // 근로계약 목록 조회
  async getContracts(employeeId?: number, limit: number = 20): Promise<Contract[]> {
    try {
      console.log('근로계약 목록 조회 시작:', employeeId);
      
      const params = new URLSearchParams();
      if (employeeId) {
        params.append('employeeId', employeeId.toString());
      }
      params.append('limit', limit.toString());
      
      const response = await fetch(`/api/odoo/contracts?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('근로계약 목록 조회 결과:', result);
      
      return result || [];
    } catch (error) {
      console.error('근로계약 목록 조회 실패:', error);
      return [];
    }
  }

  // 연차/휴가 목록 조회
  async getHolidays(employeeId?: number, limit: number = 20): Promise<Holiday[]> {
    try {
      console.log('연차/휴가 목록 조회 시작:', employeeId);
      
      const params = new URLSearchParams();
      if (employeeId) {
        params.append('employeeId', employeeId.toString());
      }
      params.append('limit', limit.toString());
      
      const response = await fetch(`/api/odoo/holidays?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('연차/휴가 목록 조회 결과:', result);
      
      return result || [];
    } catch (error) {
      console.error('연차/휴가 목록 조회 실패:', error);
      return [];
    }
  }

  // 근태 정보 조회
  async getAttendances(employeeId?: number, limit: number = 50): Promise<Attendance[]> {
    try {
      console.log('근태 정보 조회 시작:', employeeId);
      
      const params = new URLSearchParams();
      if (employeeId) {
        params.append('employeeId', employeeId.toString());
      }
      params.append('limit', limit.toString());
      
      const response = await fetch(`/api/odoo/attendance?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('근태 정보 조회 결과:', result);
      
      return result || [];
    } catch (error) {
      console.error('근태 정보 조회 실패:', error);
      return [];
    }
  }

  // 급여 정보 조회
  async getPayrolls(employeeId?: number, limit: number = 20): Promise<any[]> {
    try {
      console.log('급여 정보 조회 시작');
      
      const response = await fetch('/api/odoo/payroll');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('급여 정보 조회 결과:', result);
      
      // API 응답에서 data 필드를 추출
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      } else {
        console.error('급여 데이터가 올바르지 않습니다:', result);
        return [];
      }
    } catch (error) {
      console.error('급여 정보 조회 실패:', error);
      return [];
    }
  }

  // 급여 계약 생성
  async createPayroll(data: any): Promise<boolean> {
    try {
      console.log('급여 계약 생성 시작:', data);
      
      const response = await fetch('/api/odoo/payroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('급여 계약 생성 결과:', result);
      
      return result.success || false;
    } catch (error) {
      console.error('급여 계약 생성 실패:', error);
      return false;
    }
  }

  // 급여 계약 수정
  async updatePayroll(payrollId: number, data: any): Promise<boolean> {
    try {
      console.log('급여 계약 수정 시작:', payrollId, data);
      
      const response = await fetch(`/api/odoo/payroll/${payrollId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('급여 계약 수정 결과:', result);
      
      return result.success || false;
    } catch (error) {
      console.error('급여 계약 수정 실패:', error);
      return false;
    }
  }

  // 급여 계약 삭제
  async deletePayroll(payrollId: number): Promise<boolean> {
    try {
      console.log('급여 계약 삭제 시작:', payrollId);
      
      const response = await fetch(`/api/odoo/payroll/${payrollId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('급여 계약 삭제 결과:', result);
      
      return result.success || false;
    } catch (error) {
      console.error('급여 계약 삭제 실패:', error);
      return false;
    }
  }

  // 통계 데이터 조회
  async getStats(): Promise<{
    totalEmployees: number;
    totalDepartments: number;
    todayAttendances: number;
    todayLeaves: number;
  } | null> {
    try {
      console.log('통계 데이터 조회 시작');
      
      const response = await fetch('/api/odoo/stats');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('통계 데이터 조회 결과:', result);
      
      // API 응답에서 data 필드를 추출
      if (result.success && result.data) {
        return result.data;
      } else {
        console.error('통계 데이터가 올바르지 않습니다:', result);
        return null;
      }
    } catch (error) {
      console.error('통계 데이터 조회 실패:', error);
      return null;
    }
  }

  // 직무 목록 조회
  async getJobs(): Promise<any[]> {
    try {
      console.log('직무 목록 조회 시작');
      
      const response = await fetch('/api/odoo/jobs');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('직무 목록 조회 결과:', result);
      
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      } else {
        console.error('직무 데이터가 올바르지 않습니다:', result);
        return [];
      }
    } catch (error) {
      console.error('직무 목록 조회 실패:', error);
      return [];
    }
  }
}

// 싱글톤 인스턴스 생성
let odooAPIInstance: OdooAPI | null = null;

export const createOdooAPI = (auth: OdooAuth): OdooAPI => {
  if (!odooAPIInstance) {
    odooAPIInstance = new OdooAPI(auth);
  }
  return odooAPIInstance;
};

export const getOdooAPI = (): OdooAPI | null => {
  return odooAPIInstance;
};

export default OdooAPI; 