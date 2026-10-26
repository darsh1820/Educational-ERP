import {
  Student,
  Course,
  CourseGradeRecord,
  BillingRecord,
  AttendanceSummary,
  ComplianceStandard,
  AttendanceStatus,
} from '../types/academic.ts';

export interface AuditLogEntry {
  id: number;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  prevHash: string;
  currHash: string;
}

export interface OfficerPersona {
  id: string;
  name: string;
  title: string;
  role: 'REGISTRAR' | 'DEAN_FACULTY' | 'BURSAR' | 'AUDITOR';
  department: string;
  avatarInitials: string;
  permissions: string[];
}

export interface SystemHealth {
  status: string;
  engine: string;
  databaseFile: string;
  records: {
    students: number;
    grades: number;
    billing: number;
    auditEntries: number;
  };
  cryptographicMerkleRoot: string;
  timestamp: string;
}

// Current active officer state in browser
let activeOfficer: OfficerPersona = {
  id: 'OFFICER-001',
  name: 'Dr. Evelyn Vance',
  title: 'University Registrar',
  role: 'REGISTRAR',
  department: 'Office of Academic Records & Governance',
  avatarInitials: 'EV',
  permissions: ['*'],
};

export function getActiveOfficer(): OfficerPersona {
  return activeOfficer;
}

export function setActiveOfficer(officer: OfficerPersona): void {
  activeOfficer = officer;
}

function getHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-officer-role': activeOfficer.role,
    'x-officer-id': activeOfficer.id,
  };
}

// REST Client functions
export async function apiGetHealth(): Promise<SystemHealth> {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function apiGetPersonas(): Promise<OfficerPersona[]> {
  const res = await fetch('/api/auth/personas');
  if (!res.ok) throw new Error('Failed to fetch personas');
  return res.json();
}

export async function apiGetStudents(): Promise<Student[]> {
  const res = await fetch('/api/students', { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
}

export async function apiGetStudentDossier(id: string): Promise<{
  student: Student;
  grades: CourseGradeRecord[];
  billing?: BillingRecord;
  attendance?: AttendanceSummary;
}> {
  const res = await fetch(`/api/students/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch student dossier');
  return res.json();
}

export async function apiGetCourses(): Promise<Course[]> {
  const res = await fetch('/api/courses', { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch courses');
  return res.json();
}

export async function apiGetGrades(): Promise<CourseGradeRecord[]> {
  const res = await fetch('/api/grades', { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch grades');
  return res.json();
}

export async function apiUpdateGrade(
  gradeId: string,
  scores: Partial<CourseGradeRecord>
): Promise<{ success: boolean; weightedTotal: number; letterGrade: string; status: string; auditHash: string }> {
  const res = await fetch(`/api/grades/${gradeId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(scores),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update grade marks');
  }
  return res.json();
}

export async function apiApplyBatchCurve(delta = 2.5): Promise<{ success: boolean; auditHash: string }> {
  const res = await fetch('/api/grades/batch-curve', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ delta }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to apply bell curve');
  }
  return res.json();
}

export async function apiPublishGrades(): Promise<{ success: boolean; auditHash: string }> {
  const res = await fetch('/api/grades/publish', {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to publish grades');
  }
  return res.json();
}

export async function apiGetBilling(): Promise<BillingRecord[]> {
  const res = await fetch('/api/billing', { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch billing records');
  return res.json();
}

export async function apiReconcilePayment(
  billingId: string,
  amount: number,
  paymentMethod: string
): Promise<{ success: boolean; newPaid: number; newBalance: number; newStatus: string; auditHash: string }> {
  const res = await fetch('/api/billing/reconcile', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ billingId, amount, paymentMethod }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to reconcile payment');
  }
  return res.json();
}

export async function apiGetAttendance(): Promise<AttendanceSummary[]> {
  const res = await fetch('/api/attendance', { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch attendance');
  return res.json();
}

export async function apiMarkAttendance(
  studentId: string,
  status: AttendanceStatus
): Promise<{ success: boolean; newRate: number; consecutive: number; requiresIntervention: boolean; auditHash: string }> {
  const res = await fetch('/api/attendance/mark', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ studentId, status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to mark attendance');
  }
  return res.json();
}

export async function apiGetCompliance(): Promise<ComplianceStandard[]> {
  const res = await fetch('/api/compliance', { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch compliance standards');
  return res.json();
}

export async function apiReverifyCompliance(): Promise<{ success: boolean; lastAuditDate: string; auditHash: string }> {
  const res = await fetch('/api/compliance/reverify', {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to reverify compliance');
  }
  return res.json();
}

export async function apiGetAuditTrail(): Promise<{
  entries: AuditLogEntry[];
  chainValid: boolean;
  totalEntries: number;
  merkleRoot: string;
}> {
  const res = await fetch('/api/audit', { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch audit trail');
  return res.json();
}
