export type ViewMode = 'overview' | 'grades' | 'billing' | 'attendance' | 'compliance' | 'students' | 'audit';

export type AcademicTerm = 'Fall 2026' | 'Spring 2027' | 'Summer 2026' | 'Academic Year 2026-27';

export type FacultyDepartment =
  | 'All Departments'
  | 'Engineering & Computer Science'
  | 'School of Business'
  | 'Natural & Health Sciences'
  | 'Humanities & Social Sciences'
  | 'School of Law';

export type StudentStanding = 'Dean\'s List' | 'Good Standing' | 'Academic Probation' | 'Honors Program';

export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue' | 'Partial';

export type BillingTier = 'Tier 1 - Resident Undergrad' | 'Tier 2 - Non-Resident' | 'Tier 3 - Graduate Fellowship' | 'Tier 4 - Executive MBA';

export type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'Excused';

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  department: FacultyDepartment;
  program: string;
  cohortYear: number;
  standing: StudentStanding;
  gpa: number;
  creditsCompleted: number;
  totalCreditsRequired: number;
  advisor: string;
  phone: string;
  address: string;
  residency: 'In-State' | 'Out-of-State' | 'International';
  financialAidPercent: number;
}

export interface CourseGradeRecord {
  id: string;
  studentId: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  midtermScore: number; // 30%
  finalExamScore: number; // 40%
  practicumScore: number; // 20%
  continuousScore: number; // 10%
  weightedTotal: number;
  letterGrade: string;
  status: 'Published' | 'Draft' | 'Under Review';
  lastModified: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  department: FacultyDepartment;
  instructor: string;
  credits: number;
  term: AcademicTerm;
  enrolledCount: number;
  capacity: number;
  schedule: string;
  room: string;
}

export interface BillingRecord {
  id: string;
  studentId: string;
  invoiceNumber: string;
  tier: BillingTier;
  tuitionAssessment: number;
  fees: number;
  financialAidDeduction: number;
  netDue: number;
  paidAmount: number;
  remainingBalance: number;
  status: PaymentStatus;
  dueDate: string;
  lastPaymentDate?: string;
  paymentMethod?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
  timeLogged: string;
}

export interface AttendanceSummary {
  studentId: string;
  totalSessions: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  excusedCount: number;
  rate: number; // percentage
  consecutiveAbsences: number;
  requiresIntervention: boolean;
}

export interface ComplianceStandard {
  id: string;
  code: string;
  title: string;
  governingBody: 'ABET' | 'Higher Learning Commission' | 'Dept of Education' | 'FERPA';
  description: string;
  complianceRate: number; // percentage
  status: 'Compliant' | 'In Review' | 'Action Required';
  lastAuditDate: string;
  nextRenewalDate: string;
  leadOfficer: string;
  openFindingsCount: number;
}
