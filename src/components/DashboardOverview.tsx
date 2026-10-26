import React from 'react';
import {
  Users,
  GraduationCap,
  CreditCard,
  CalendarCheck2,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  Student,
  CourseGradeRecord,
  BillingRecord,
  AttendanceSummary,
  ComplianceStandard,
  ViewMode,
} from '../types/academic';
import { KPICard } from './KPICard';
import { StatusBadge } from './StatusBadge';

interface DashboardOverviewProps {
  students: Student[];
  grades: CourseGradeRecord[];
  billingRecords: BillingRecord[];
  attendanceRecords: AttendanceSummary[];
  complianceStandards: ComplianceStandard[];
  onNavigate: (view: ViewMode) => void;
  onSelectStudent: (student: Student) => void;
  onOpenPaymentModal: () => void;
  onOpenAuditModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  students,
  grades,
  billingRecords,
  attendanceRecords,
  complianceStandards,
  onNavigate,
  onSelectStudent,
  onOpenPaymentModal,
  onOpenAuditModal,
}) => {
  // Compute Key Metrics
  const totalStudents = students.length;
  const avgGpa = (students.reduce((acc, s) => acc + s.gpa, 0) / totalStudents).toFixed(2);
  const totalBilled = billingRecords.reduce((acc, b) => acc + b.netDue, 0);
  const totalCollected = billingRecords.reduce((acc, b) => acc + b.paidAmount, 0);
  const collectionRate = ((totalCollected / totalBilled) * 100).toFixed(1);

  const avgAttendance = (
    attendanceRecords.reduce((acc, a) => acc + a.rate, 0) / attendanceRecords.length
  ).toFixed(1);

  const overdueBillingCount = billingRecords.filter((b) => b.status === 'Overdue').length;
  const probationCount = students.filter((s) => s.standing === 'Academic Probation').length;
  const compliantStandards = complianceStandards.filter((c) => c.status === 'Compliant').length;
  const complianceRate = ((compliantStandards / complianceStandards.length) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Real-time Administrative Action Banner */}
      {(overdueBillingCount > 0 || probationCount > 0) && (
        <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-[#2563eb] text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-[#0f172a]">
                Registrar Operational Notice:
              </span>{' '}
              <span className="text-slate-700">
                {overdueBillingCount} delinquent student accounts require bursar review · {probationCount} student on academic probation intervention notice.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('billing')}
              className="px-3 py-1 bg-white border border-[#2563eb] text-[#2563eb] rounded font-semibold hover:bg-blue-50 transition-colors"
            >
              Reconcile Billing
            </button>
            <button
              onClick={() => onNavigate('grades')}
              className="px-3 py-1 bg-[#2563eb] text-white rounded font-semibold hover:bg-[#1d4ed8] transition-colors"
            >
              Review Grades
            </button>
          </div>
        </div>
      )}

      {/* Primary KPI Grid (Level 1 Elevation, Hairline Dividers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Active Matriculation"
          value={totalStudents.toLocaleString()}
          sublabel="Total Degree-Seeking Students"
          delta={{ value: '+4.2% vs last term', isPositive: true }}
          timeframe="Fall 2026 Cohort"
          icon={Users}
          onClick={() => onNavigate('students')}
        />
        <KPICard
          title="Institutional GPA Index"
          value={avgGpa}
          sublabel="Weighted Cross-College Average"
          delta={{ value: '+0.06 delta', isPositive: true }}
          timeframe="Accredited Scale 4.00"
          icon={GraduationCap}
          onClick={() => onNavigate('grades')}
        />
        <KPICard
          title="Tuition Collection Rate"
          value={`${collectionRate}%`}
          sublabel={`$${totalCollected.toLocaleString()} of $${totalBilled.toLocaleString()}`}
          delta={{ value: '+2.1% collection', isPositive: true }}
          timeframe="Net Bursar Assessment"
          icon={CreditCard}
          onClick={() => onNavigate('billing')}
        />
        <KPICard
          title="Classroom Adherence"
          value={`${avgAttendance}%`}
          sublabel="Optimal threshold ≥ 90%"
          delta={{ value: 'Above Standard', isPositive: true }}
          timeframe="Daily Roll-Call Sync"
          icon={CalendarCheck2}
          onClick={() => onNavigate('attendance')}
        />
      </div>

      {/* 2-Column Split: Examination Overview & Bursar Ledger Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Grade Books & Academic Highlights */}
        <div className="lg:col-span-7 bg-white border border-[#e2e8f0] rounded-lg overflow-hidden shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
          <div className="px-5 py-3.5 bg-[#f8fafc] border-b border-[#cbd5e1] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#7c3aed]" />
              <h3 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
                Recent Examination Submissions & Standing
              </h3>
            </div>
            <button
              onClick={() => onNavigate('grades')}
              className="text-xs font-semibold text-[#2563eb] hover:underline inline-flex items-center gap-1"
            >
              <span>Full Grade Book</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-[#64748b] border-b border-[#e2e8f0] text-[10px] uppercase font-semibold tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Student</th>
                  <th className="py-2.5 px-3">Course</th>
                  <th className="py-2.5 px-3 text-right">Weighted Mark</th>
                  <th className="py-2.5 px-3 text-center">Letter</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {grades.slice(0, 5).map((g) => {
                  const student = students.find((s) => s.id === g.studentId);
                  return (
                    <tr
                      key={g.id}
                      onClick={() => student && onSelectStudent(student)}
                      className="hover:bg-[#f8fafc] cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-900">{student?.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">{student?.id}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-800">{g.courseCode}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                          {g.courseTitle}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-slate-900">
                        {g.weightedTotal.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px]">
                          {g.letterGrade}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <StatusBadge
                          label={g.status}
                          variant={g.status === 'Published' ? 'paid' : 'review'}
                          size="sm"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 5 Columns: Financial Health & Bursar Status */}
        <div className="lg:col-span-5 bg-white border border-[#e2e8f0] rounded-lg overflow-hidden shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] flex flex-col justify-between">
          <div>
            <div className="px-5 py-3.5 bg-[#f8fafc] border-b border-[#cbd5e1] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#2563eb]" />
                <h3 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
                  Bursar Tuition Ledger
                </h3>
              </div>
              <button
                onClick={onOpenPaymentModal}
                className="text-xs font-semibold px-2.5 py-1 bg-[#2563eb] text-white rounded hover:bg-[#1d4ed8] transition-colors"
              >
                + Log Settlement
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Progress Bar of Collected Tuition */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">Gross Term Receipts</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    ${totalCollected.toLocaleString()} / ${totalBilled.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#059669] rounded-full transition-all duration-500"
                    style={{ width: `${collectionRate}%` }}
                  />
                </div>
              </div>

              {/* Status Breakdown Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                <div className="p-2.5 rounded bg-[#ecfdf5] border border-[#a7f3d0] text-center">
                  <div className="text-[10px] uppercase font-bold text-[#047857]">Paid in Full</div>
                  <div className="text-lg font-bold font-mono text-[#047857] mt-0.5 tabular-nums">
                    {billingRecords.filter((b) => b.status === 'Paid').length}
                  </div>
                </div>
                <div className="p-2.5 rounded bg-[#fffbeb] border border-[#fde68a] text-center">
                  <div className="text-[10px] uppercase font-bold text-[#b45309]">Pending Plan</div>
                  <div className="text-lg font-bold font-mono text-[#b45309] mt-0.5 tabular-nums">
                    {billingRecords.filter((b) => b.status === 'Pending').length}
                  </div>
                </div>
                <div className="p-2.5 rounded bg-[#fff1f2] border border-[#fecdd3] text-center">
                  <div className="text-[10px] uppercase font-bold text-[#be123c]">Delinquent</div>
                  <div className="text-lg font-bold font-mono text-[#be123c] mt-0.5 tabular-nums">
                    {overdueBillingCount}
                  </div>
                </div>
              </div>

              {/* Delinquent Quick Warning */}
              {overdueBillingCount > 0 && (
                <div className="p-3 bg-[#fff1f2] border border-[#fecdd3] rounded text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#be123c]">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Action: 1 overdue account over 30 days past census date</span>
                  </div>
                  <button
                    onClick={() => onNavigate('billing')}
                    className="text-xs font-bold text-[#be123c] underline hover:no-underline"
                  >
                    Inspect
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="px-5 py-3 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between text-xs">
            <span className="text-[#64748b]">Automatic ACH Settlement Cycle: Daily 02:00 UTC</span>
            <button
              onClick={() => onNavigate('billing')}
              className="text-[#2563eb] font-semibold hover:underline"
            >
              View All Invoices →
            </button>
          </div>
        </div>
      </div>

      {/* Compliance & Accreditation Strip */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f1f5f9]">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2563eb]" />
              <h3 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
                Institutional Accreditation & Compliance Matrix
              </h3>
            </div>
            <p className="text-xs text-[#64748b] mt-0.5">
              Verified statutory compliance rate across ABET, Higher Learning Commission, and FERPA audits: <strong className="text-slate-900">{complianceRate}%</strong>
            </p>
          </div>
          <button
            onClick={onOpenAuditModal}
            className="px-3.5 py-1.5 bg-white border border-[#cbd5e1] text-xs font-semibold text-[#0f172a] rounded hover:bg-[#f8fafc] transition-colors"
          >
            Generate Official Audit Package
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-4">
          {complianceStandards.map((std) => (
            <div
              key={std.id}
              onClick={() => onNavigate('compliance')}
              className="p-3 rounded border border-slate-200 hover:border-[#cbd5e1] hover:bg-[#f8fafc] cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono font-bold text-slate-800">{std.code}</span>
                <StatusBadge
                  label={std.status}
                  variant={std.status === 'Compliant' ? 'compliant' : 'review'}
                  size="sm"
                />
              </div>
              <div className="font-semibold text-slate-900 text-xs truncate">
                {std.title}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
                <span>Score: {std.complianceRate.toFixed(1)}%</span>
                <span className="text-[10px]">{std.governingBody}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
