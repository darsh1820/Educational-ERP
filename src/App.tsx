import React, { useState, useEffect } from 'react';
import {
  INITIAL_STUDENTS,
  INITIAL_COURSES,
  INITIAL_GRADES,
  INITIAL_BILLING,
  INITIAL_ATTENDANCE,
  INITIAL_COMPLIANCE,
} from './data/mockData.ts';
import {
  ViewMode,
  AcademicTerm,
  FacultyDepartment,
  Student,
  CourseGradeRecord,
  BillingRecord,
  AttendanceStatus,
} from './types/academic.ts';
import {
  apiGetStudents,
  apiGetCourses,
  apiGetGrades,
  apiUpdateGrade,
  apiApplyBatchCurve,
  apiPublishGrades,
  apiGetBilling,
  apiReconcilePayment,
  apiGetAttendance,
  apiMarkAttendance,
  apiGetCompliance,
  apiReverifyCompliance,
  apiGetAuditTrail,
  apiGetPersonas,
  getActiveOfficer,
  setActiveOfficer,
  OfficerPersona,
  AuditLogEntry,
} from './services/api.ts';
import { Sidebar } from './components/Sidebar.tsx';
import { TopHeader } from './components/TopHeader.tsx';
import { DashboardOverview } from './components/DashboardOverview.tsx';
import { GradeBookView } from './components/GradeBookView.tsx';
import { BillingLedgerView } from './components/BillingLedgerView.tsx';
import { AttendanceMatrixView } from './components/AttendanceMatrixView.tsx';
import { ComplianceView } from './components/ComplianceView.tsx';
import { StudentDirectoryView } from './components/StudentDirectoryView.tsx';
import { AuditTrailView } from './components/AuditTrailView.tsx';
import { StudentDrawer } from './components/StudentDrawer.tsx';
import { NewPaymentModal } from './components/NewPaymentModal.tsx';
import { AuditReportModal } from './components/AuditReportModal.tsx';
import { AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('overview');
  const [selectedTerm, setSelectedTerm] = useState<AcademicTerm>('Fall 2026');
  const [selectedDepartment, setSelectedDepartment] = useState<FacultyDepartment>('All Departments');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Officer personas & active RBAC identity
  const [activeOfficer, setCurrentOfficer] = useState<OfficerPersona>(getActiveOfficer());
  const [personas, setPersonas] = useState<OfficerPersona[]>([
    {
      id: 'OFFICER-001',
      name: 'Dr. Evelyn Vance',
      title: 'University Registrar',
      role: 'REGISTRAR',
      department: 'Office of Academic Records & Governance',
      avatarInitials: 'EV',
      permissions: ['*'],
    },
    {
      id: 'OFFICER-002',
      name: 'Prof. Claire Sterling',
      title: 'Dean of Academic Affairs',
      role: 'DEAN_FACULTY',
      department: 'College Curriculum & Faculty Senate',
      avatarInitials: 'CS',
      permissions: ['grades:write', 'grades:curve'],
    },
    {
      id: 'OFFICER-003',
      name: 'Marcus Sterling',
      title: 'University Bursar',
      role: 'BURSAR',
      department: 'Treasury & Financial Accounts',
      avatarInitials: 'MS',
      permissions: ['billing:write', 'billing:reconcile'],
    },
    {
      id: 'OFFICER-004',
      name: 'Sarah Jenkins',
      title: 'Lead Accreditation Auditor',
      role: 'AUDITOR',
      department: 'State Board of Regents & ABET',
      avatarInitials: 'SJ',
      permissions: ['audit:read', 'compliance:verify'],
    },
  ]);

  // Main state data
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [grades, setGrades] = useState<CourseGradeRecord[]>(INITIAL_GRADES);
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>(INITIAL_BILLING);
  const [attendanceRecords, setAttendanceRecords] = useState(INITIAL_ATTENDANCE);
  const [complianceStandards, setComplianceStandards] = useState(INITIAL_COMPLIANCE);

  // Cryptographic audit logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [chainValid, setChainValid] = useState<boolean>(true);
  const [merkleRoot, setMerkleRoot] = useState<string>('INITIALIZING...');
  const [isAuditLoading, setIsAuditLoading] = useState<boolean>(false);

  // Inspector & Modal states
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<Student | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  // Toast message for security / audit feedback
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch initial data from persistent backend
  const loadBackendData = async () => {
    try {
      const [fetchedStudents, fetchedCourses, fetchedGrades, fetchedBilling, fetchedAttendance, fetchedCompliance, auditTrail, fetchedPersonas] =
        await Promise.all([
          apiGetStudents().catch(() => INITIAL_STUDENTS),
          apiGetCourses().catch(() => INITIAL_COURSES),
          apiGetGrades().catch(() => INITIAL_GRADES),
          apiGetBilling().catch(() => INITIAL_BILLING),
          apiGetAttendance().catch(() => INITIAL_ATTENDANCE),
          apiGetCompliance().catch(() => INITIAL_COMPLIANCE),
          apiGetAuditTrail().catch(() => ({ entries: [], chainValid: true, totalEntries: 0, merkleRoot: 'GENESIS' })),
          apiGetPersonas().catch(() => personas),
        ]);

      setStudents(fetchedStudents);
      setCourses(fetchedCourses);
      setGrades(fetchedGrades);
      setBillingRecords(fetchedBilling);
      setAttendanceRecords(fetchedAttendance);
      setComplianceStandards(fetchedCompliance);
      setAuditLogs(auditTrail.entries);
      setChainValid(auditTrail.chainValid);
      setMerkleRoot(auditTrail.merkleRoot);
      if (fetchedPersonas && fetchedPersonas.length > 0) {
        setPersonas(fetchedPersonas);
      }
    } catch (err: any) {
      console.warn('Backend sync in fallback mode:', err);
    }
  };

  useEffect(() => {
    loadBackendData();
  }, []);

  const refreshAuditTrail = async () => {
    setIsAuditLoading(true);
    try {
      const auditTrail = await apiGetAuditTrail();
      setAuditLogs(auditTrail.entries);
      setChainValid(auditTrail.chainValid);
      setMerkleRoot(auditTrail.merkleRoot);
      showToast('success', 'Cryptographic SHA-256 chain successfully re-verified.');
    } catch (err: any) {
      showToast('error', 'Audit trail verification failed');
    } finally {
      setIsAuditLoading(false);
    }
  };

  // Switch persona handler
  const handleSwitchPersona = (persona: OfficerPersona) => {
    setCurrentOfficer(persona);
    setActiveOfficer(persona);
    showToast('info', `Switched active session to ${persona.name} (${persona.role})`);
  };

  // Department-filtered students
  const activeStudents = students.filter((s) => {
    if (selectedDepartment === 'All Departments') return true;
    return s.department === selectedDepartment;
  });

  // REST Backend Handlers
  const handleUpdateGrade = async (gradeId: string, updatedScores: Partial<CourseGradeRecord>) => {
    try {
      const result = await apiUpdateGrade(gradeId, updatedScores);
      setGrades((prev) =>
        prev.map((g) =>
          g.id === gradeId
            ? {
                ...g,
                ...updatedScores,
                weightedTotal: result.weightedTotal,
                letterGrade: result.letterGrade,
                status: (result.status as any) || g.status,
              }
            : g
        )
      );
      showToast('success', `Grade updated. SHA-256 Hash: ${result.auditHash.slice(0, 8)}...`);
      apiGetAuditTrail().then((a) => {
        setAuditLogs(a.entries);
        setMerkleRoot(a.merkleRoot);
      });
    } catch (err: any) {
      showToast('error', err.message || 'Permission denied or update failed');
    }
  };

  const handleRecordPayment = async (billingId: string, amount: number, method: string) => {
    try {
      const result = await apiReconcilePayment(billingId, amount, method);
      setBillingRecords((prev) =>
        prev.map((b) =>
          b.id === billingId
            ? {
                ...b,
                paidAmount: result.newPaid,
                remainingBalance: result.newBalance,
                status: result.newStatus as any,
                lastPaymentDate: new Date().toISOString().slice(0, 10),
                paymentMethod: method,
              }
            : b
        )
      );
      showToast('success', `Remittance posted to SQLite. Balance: $${result.newBalance.toLocaleString()}`);
      apiGetAuditTrail().then((a) => {
        setAuditLogs(a.entries);
        setMerkleRoot(a.merkleRoot);
      });
    } catch (err: any) {
      showToast('error', err.message || 'Payment settlement rejected by security policy');
    }
  };

  const handleUpdateAttendance = async (studentId: string, status: AttendanceStatus) => {
    try {
      const result = await apiMarkAttendance(studentId, status);
      setAttendanceRecords((prev) =>
        prev.map((a) =>
          a.studentId === studentId
            ? {
                ...a,
                rate: result.newRate,
                consecutiveAbsences: result.consecutive,
                requiresIntervention: result.requiresIntervention,
              }
            : a
        )
      );
      apiGetAuditTrail().then((a) => {
        setAuditLogs(a.entries);
        setMerkleRoot(a.merkleRoot);
      });
    } catch (err: any) {
      showToast('error', err.message || 'Attendance roll-call rejected');
    }
  };

  const handleRefreshAudit = async () => {
    try {
      const result = await apiReverifyCompliance();
      setComplianceStandards((prev) =>
        prev.map((s) => ({
          ...s,
          complianceRate: Math.min(100, Math.round((s.complianceRate + 0.2) * 10) / 10),
          lastAuditDate: result.lastAuditDate,
        }))
      );
      showToast('success', 'Statutory compliance standards audited and verified.');
      apiGetAuditTrail().then((a) => {
        setAuditLogs(a.entries);
        setMerkleRoot(a.merkleRoot);
      });
    } catch (err: any) {
      showToast('error', err.message || 'Accreditation reverification failed');
    }
  };

  // Quick Export Handler based on Current View
  const handleQuickExport = () => {
    let filename = `AcademicPrecision_${currentView}_${selectedTerm.replace(/\s+/g, '_')}.csv`;
    let csvData = '';

    if (currentView === 'grades') {
      csvData =
        'Student ID,Course,Midterm,Final,Practicum,Weighted Total,Grade,Status\n' +
        grades
          .map(
            (g) =>
              `${g.studentId},${g.courseCode},${g.midtermScore},${g.finalExamScore},${g.practicumScore},${g.weightedTotal},${g.letterGrade},${g.status}`
          )
          .join('\n');
    } else if (currentView === 'billing') {
      csvData =
        'Invoice,Student ID,Tier,Net Billed,Paid,Balance,Status,Due Date\n' +
        billingRecords
          .map(
            (b) =>
              `${b.invoiceNumber},${b.studentId},"${b.tier}",${b.netDue},${b.paidAmount},${b.remainingBalance},${b.status},${b.dueDate}`
          )
          .join('\n');
    } else if (currentView === 'attendance') {
      csvData =
        'Student ID,Total Sessions,Present,Late,Absent,Excused,Rate %\n' +
        attendanceRecords
          .map(
            (a) =>
              `${a.studentId},${a.totalSessions},${a.presentCount},${a.lateCount},${a.absentCount},${a.excusedCount},${a.rate}`
          )
          .join('\n');
    } else if (currentView === 'audit') {
      csvData =
        'Log ID,Timestamp,Actor ID,Actor Name,Role,Action,Resource,Resource ID,Details,Prev Hash,Curr Hash\n' +
        auditLogs
          .map(
            (l) =>
              `${l.id},${l.timestamp},${l.actorId},"${l.actorName}",${l.actorRole},${l.action},${l.resource},${l.resourceId},"${l.details.replace(/"/g, '""')}",${l.prevHash},${l.currHash}`
          )
          .join('\n');
    } else {
      csvData =
        'Student ID,Name,Department,Program,GPA,Standing,Credits\n' +
        students
          .map(
            (s) =>
              `${s.id},"${s.name}","${s.department}","${s.program}",${s.gpa},"${s.standing}",${s.creditsCompleted}`
          )
          .join('\n');
    }

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Counters for sidebar badges
  const pendingBillingCount = billingRecords.filter((b) => b.status === 'Overdue' || b.status === 'Pending').length;
  const probationStudentCount = students.filter((s) => s.standing === 'Academic Probation').length;
  const openFindingsCount = complianceStandards.reduce((acc, c) => acc + c.openFindingsCount, 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0b1c30]">
      {/* Toast Security Banner */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-2 duration-150 ${
            toastMessage.type === 'error'
              ? 'bg-[#fff1f2] text-[#be123c] border border-[#fecdd3]'
              : toastMessage.type === 'success'
              ? 'bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]'
              : 'bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <ShieldAlert className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={(v) => {
          setCurrentView(v);
          setMobileMenuOpen(false);
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        selectedTerm={selectedTerm}
        onChangeTerm={setSelectedTerm}
        selectedDepartment={selectedDepartment}
        onChangeDepartment={setSelectedDepartment}
        pendingBillingCount={pendingBillingCount}
        probationStudentCount={probationStudentCount}
        openFindingsCount={openFindingsCount}
      />

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Administrative Viewport */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-200 ${
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
        }`}
      >
        {/* Top Header with RBAC Persona Switcher */}
        <TopHeader
          currentView={currentView}
          selectedTerm={selectedTerm}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          onQuickExport={handleQuickExport}
          activeOfficer={activeOfficer}
          personas={personas}
          onSwitchPersona={handleSwitchPersona}
        />

        {/* Viewport Canvas (24px margin / padding from spec) */}
        <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto">
          {currentView === 'overview' && (
            <DashboardOverview
              students={activeStudents}
              grades={grades}
              billingRecords={billingRecords}
              attendanceRecords={attendanceRecords}
              complianceStandards={complianceStandards}
              onNavigate={setCurrentView}
              onSelectStudent={setSelectedStudentForDrawer}
              onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
              onOpenAuditModal={() => setIsAuditModalOpen(true)}
            />
          )}

          {currentView === 'grades' && (
            <GradeBookView
              courses={courses}
              grades={grades}
              students={activeStudents}
              onUpdateGrade={handleUpdateGrade}
              onSelectStudent={setSelectedStudentForDrawer}
            />
          )}

          {currentView === 'billing' && (
            <BillingLedgerView
              billingRecords={billingRecords}
              students={activeStudents}
              onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
              onSelectStudent={setSelectedStudentForDrawer}
            />
          )}

          {currentView === 'attendance' && (
            <AttendanceMatrixView
              attendanceRecords={attendanceRecords}
              students={activeStudents}
              onUpdateAttendance={handleUpdateAttendance}
              onSelectStudent={setSelectedStudentForDrawer}
            />
          )}

          {currentView === 'compliance' && (
            <ComplianceView
              standards={complianceStandards}
              term={selectedTerm}
              onOpenAuditModal={() => setIsAuditModalOpen(true)}
              onRefreshAudit={handleRefreshAudit}
            />
          )}

          {currentView === 'students' && (
            <StudentDirectoryView
              students={activeStudents}
              onSelectStudent={setSelectedStudentForDrawer}
            />
          )}

          {currentView === 'audit' && (
            <AuditTrailView
              auditLogs={auditLogs}
              chainValid={chainValid}
              merkleRoot={merkleRoot}
              onRefresh={refreshAuditTrail}
              isLoading={isAuditLoading}
            />
          )}
        </main>
      </div>

      {/* Student Profile & Record Inspector Flyout Drawer */}
      <StudentDrawer
        student={selectedStudentForDrawer}
        onClose={() => setSelectedStudentForDrawer(null)}
        grades={grades.filter((g) => g.studentId === selectedStudentForDrawer?.id)}
        billing={billingRecords.find((b) => b.studentId === selectedStudentForDrawer?.id)}
        attendance={attendanceRecords.find((a) => a.studentId === selectedStudentForDrawer?.id)}
      />

      {/* Tuition Payment Modal */}
      <NewPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        billingRecords={billingRecords}
        students={students}
        onRecordPayment={handleRecordPayment}
      />

      {/* Institutional Audit Package Modal */}
      <AuditReportModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        standards={complianceStandards}
        term={selectedTerm}
      />
    </div>
  );
}
