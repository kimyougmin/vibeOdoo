// 기본 인터페이스들
export interface OdooAuth {
  url: string;
  database: string;
  username: string;
  password: string;
}

export interface OdooResponse<T = any> {
  result?: T;
  error?: OdooError;
}

export interface OdooError {
  code: number;
  message: string;
  data?: any;
}

export interface OdooRequestOptions {
  timeout?: number;
  headers?: Record<string, string>;
}

// HR 모듈 인터페이스들
export interface Employee {
  id: number;
  name: string;
  work_email?: string;
  work_phone?: string;
  job_title?: string;
  department_id?: [number, string]; // [id, name]
  work_location_id?: [number, string];
  work_contact_id?: [number, string];
  create_date?: string;
  write_date?: string;
  gender?: string;
  contract_ids?: any[];
}

export interface Department {
  id: number;
  name: string;
  complete_name?: string;
  parent_id?: [number, string];
  manager_id?: [number, string];
  member_ids?: number[];
}

export interface Attendance {
  id: number;
  employee_id: [number, string];
  check_in: string;
  check_out?: string;
  worked_hours?: number;
}

export interface Payroll {
  id: number;
  employee_id: [number, string];
  date_from: string;
  date_to: string;
  state: string;
  number: string;
}

export interface Contract {
  id: number;
  name: string;
  employee_id: [number, string];
  department_id?: [number, string];
  job_id?: [number, string];
  date_start: string;
  date_end?: string;
  wage: number;
  state: string;
}

export interface Holiday {
  id: number;
  name: string;
  employee_id: [number, string];
  holiday_status_id: [number, string];
  date_from: string;
  date_to: string;
  number_of_days: number;
  state: string;
}

export interface Job {
  id: number;
  name: string;
  description?: string;
  department_id?: [number, string];
}

export interface WorkLocation {
  id: number;
  name: string;
  address_id?: [number, string];
}

export interface Skill {
  id: number;
  name: string;
  category_id?: [number, string];
  level_progress?: number;
}

export interface EmployeeSkill {
  id: number;
  employee_id: [number, string];
  skill_id: [number, string];
  skill_level_id?: [number, string];
  skill_type_id?: [number, string];
}

export interface Timesheet {
  id: number;
  employee_id: [number, string];
  project_id?: [number, string];
  task_id?: [number, string];
  date: string;
  unit_amount: number;
  name: string;
}

export interface Expense {
  id: number;
  employee_id: [number, string];
  name: string;
  date: string;
  amount: number;
  state: string;
  product_id?: [number, string];
}

export interface Appraisal {
  id: number;
  employee_id: [number, string];
  manager_id?: [number, string];
  date: string;
  state: string;
  rating?: number;
  note?: string;
} 