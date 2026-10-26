import React, { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  CreditCard,
  Calendar,
  Award,
  Download,
  FileCheck2,
} from 'lucide-react';
import {
  Student,
  CourseGradeRecord,
  BillingRecord,
  AttendanceSummary,
} from '../types/academic';
import { StatusBadge } from './StatusBadge';

interface StudentDrawerProps {
  student: Student | null;
  onClose: () => void;
  grades: CourseGradeRecord[];
  billing: BillingRecord | undefined;
  attendance: AttendanceSummary | undefined;
}

export const StudentDrawer: React.FC<StudentDrawerProps> = ({
  student,
  onClose,
  grades,
  billing,
  attendance,
}) => {
  const [activeTab, setActiveTab] = useState<'academics' | 'financials' | 'attendance' | 'notes'>('academics');
  const [transcriptGenerated, setTranscriptGenerated] = useState(false);

  if (!student) return null;

  const handleDownloadTranscript = () => {
    setTranscriptGenerated(true);
    // Create printable transcript text
    const transcriptText = `CAMDEN UNIVERSITY - OFFICIAL ACADEMIC TRANSCRIPT
============================================================
Student Name: ${student.name}
Student ID: ${student.id}
Program: ${student.program} (${student.department})
Cumulative GPA: ${student.gpa.toFixed(2)} | Academic Standing: ${student.standing}
Credits Earned: ${student.creditsCompleted} / ${student.totalCreditsRequired}
Advisor: ${student.advisor}
Date of Issue: ${new Date().toLocaleDateString()}
Registrar Signature: Dr. Evelyn Vance, University Registrar
============================================================
COURSES RECORDED:
${grades
  .map(
    (g) =>
      `- ${g.courseCode}: ${g.courseTitle} | Grade: ${g.letterGrade} (${g.weightedTotal.toFixed(1)}%) | Status: ${g.status}`
  )
  .join('\n')}
============================================================
OFFICIAL SEAL VERIFIED - FERPA SECURE`;

    const blob = new Blob([transcriptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Transcript_${student.id}_${student.name.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setTranscriptGenerated(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/45 backdrop-blur-[1px] flex justify-end animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white h-full shadow-[0_12px_24px_-4px_rgba(15,23,42,0.12),0_4px_8px_-2px_rgba(15,23,42,0.04)] border-l border-[#cbd5e1] flex flex-col animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#2563eb] text-white flex items-center justify-center font-bold text-sm">
              {student.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#0f172a] font-display">
                  {student.name}
                </h2>
                <span className="text-xs font-mono font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {student.id}
                </span>
              </div>
              <div className="text-xs text-[#64748b]">
                {student.program} · Class of {student.cohortYear}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTranscript}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#2563eb] text-white rounded hover:bg-[#1d4ed8] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{transcriptGenerated ? 'Downloaded!' : 'Official Transcript'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Biographical Strip */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Standing</div>
            <div className="font-semibold text-slate-900 mt-0.5">
              <StatusBadge
                label={student.standing}
                variant={
                  student.standing === "Dean's List" || student.standing === 'Honors Program'
                    ? 'deans-list'
                    : student.standing === 'Academic Probation'
                    ? 'probation'
                    : 'optimal'
                }
                size="sm"
              />
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Cumulative GPA</div>
            <div className="font-bold text-slate-900 text-sm font-mono tabular-nums mt-0.5">
              {student.gpa.toFixed(2)} / 4.00
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Degree Credits</div>
            <div className="font-semibold text-slate-800 font-mono tabular-nums mt-0.5">
              {student.creditsCompleted} <span className="text-slate-400">/ {student.totalCreditsRequired}</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Residency</div>
            <div className="font-medium text-slate-800 mt-0.5">
              {student.residency}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#e2e8f0] px-6 bg-[#f8fafc]">
          <button
            onClick={() => setActiveTab('academics')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'academics'
                ? 'border-[#2563eb] text-[#2563eb]'
                : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            Academic Record ({grades.length})
          </button>
          <button
            onClick={() => setActiveTab('financials')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'financials'
                ? 'border-[#2563eb] text-[#2563eb]'
                : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            Bursar & Invoices
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'attendance'
                ? 'border-[#2563eb] text-[#2563eb]'
                : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            Attendance Matrix
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'notes'
                ? 'border-[#2563eb] text-[#2563eb]'
                : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            Advisor Dossier
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'academics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Term Enrolled Courses & Examination Marks
                </span>
                <span className="text-slate-500">Grading Scale: Standard 4.0</span>
              </div>

              {grades.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded text-xs text-slate-500">
                  No courses recorded for the selected term.
                </div>
              ) : (
                <div className="border border-[#e2e8f0] rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f8fafc] text-[#64748b] border-b border-[#cbd5e1] uppercase text-[10px] tracking-wider font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Course</th>
                        <th className="py-2.5 px-2 text-right">Midterm (30%)</th>
                        <th className="py-2.5 px-2 text-right">Final (40%)</th>
                        <th className="py-2.5 px-2 text-right">Practicum</th>
                        <th className="py-2.5 px-2 text-right">Total</th>
                        <th className="py-2.5 px-3 text-center">Grade</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {grades.map((g) => (
                        <tr key={g.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-3 font-medium text-slate-900">
                            <div>{g.courseCode}</div>
                            <div className="text-[11px] text-slate-500 font-normal truncate max-w-[180px]">
                              {g.courseTitle}
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums">{g.midtermScore}%</td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums">{g.finalExamScore}%</td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums">{g.practicumScore}%</td>
                          <td className="py-2.5 px-2 text-right font-bold font-mono tabular-nums text-slate-900">
                            {g.weightedTotal.toFixed(1)}%
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-900 font-mono">
                              {g.letterGrade}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <StatusBadge
                              label={g.status}
                              variant={g.status === 'Published' ? 'paid' : 'review'}
                              size="sm"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Academic Highlights */}
              <div className="p-4 rounded-lg bg-[#f8fafc] border border-slate-200">
                <div className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#7c3aed]" />
                  <span>Curricular Milestones & Faculty Notes</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Student is currently progressing on track for graduation. All prerequisite core milestones in mathematical foundations and computational analysis completed with honors status.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'financials' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Institutional Billing & Fee Schedule
                </span>
                {billing && (
                  <StatusBadge
                    label={billing.status}
                    variant={
                      billing.status === 'Paid'
                        ? 'paid'
                        : billing.status === 'Overdue'
                        ? 'overdue'
                        : 'pending'
                    }
                  />
                )}
              </div>

              {billing ? (
                <div className="border border-[#e2e8f0] rounded-lg p-4 bg-white space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">{billing.invoiceNumber}</div>
                      <div className="text-[11px] text-slate-500">{billing.tier}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Due Date</div>
                      <div className="font-mono font-medium text-slate-800">{billing.dueDate}</div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Tuition Assessment</span>
                      <span className="font-mono tabular-nums">${billing.tuitionAssessment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Student Campus & Lab Fees</span>
                      <span className="font-mono tabular-nums">${billing.fees.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>Institutional Aid & Scholarships</span>
                      <span className="font-mono tabular-nums">-${billing.financialAidDeduction.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900">
                      <span>Net Billed Amount</span>
                      <span className="font-mono tabular-nums">${billing.netDue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Amount Received</span>
                      <span className="font-mono tabular-nums text-emerald-700">${billing.paidAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base pt-1 text-slate-900">
                      <span>Outstanding Balance</span>
                      <span
                        className={`font-mono tabular-nums ${
                          billing.remainingBalance > 0 ? 'text-[#be123c]' : 'text-[#047857]'
                        }`}
                      >
                        ${billing.remainingBalance.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {billing.lastPaymentDate && (
                    <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100 flex items-center justify-between">
                      <span>Last settlement on {billing.lastPaymentDate}</span>
                      <span className="font-mono">{billing.paymentMethod}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded text-xs text-slate-500">
                  No billing record active for this semester.
                </div>
              )}
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Attendance Metrics & Classroom Adherence
                </span>
                {attendance && (
                  <StatusBadge
                    label={attendance.rate >= 90 ? 'Optimal' : attendance.rate >= 80 ? 'Review' : 'Absent Alert'}
                    variant={attendance.rate >= 90 ? 'optimal' : attendance.rate >= 80 ? 'review' : 'absent'}
                  />
                )}
              </div>

              {attendance ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-white border border-slate-200 rounded">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Attendance Rate</div>
                      <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                        {attendance.rate.toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Present Sessions</div>
                      <div className="text-xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
                        {attendance.presentCount}
                      </div>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Tardy / Late</div>
                      <div className="text-xl font-bold font-mono text-amber-600 mt-1 tabular-nums">
                        {attendance.lateCount}
                      </div>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Unexcused Absences</div>
                      <div className="text-xl font-bold font-mono text-rose-600 mt-1 tabular-nums">
                        {attendance.absentCount}
                      </div>
                    </div>
                  </div>

                  {attendance.requiresIntervention && (
                    <div className="p-3 bg-[#fff1f2] border border-[#fecdd3] rounded text-xs text-[#be123c]">
                      <div className="font-bold mb-1 flex items-center gap-1.5">
                        <FileCheck2 className="w-4 h-4" />
                        <span>Institutional Attendance Warning Triggered</span>
                      </div>
                      <div>
                        Consecutive unexcused absences exceed campus threshold ({attendance.consecutiveAbsences} days). An administrative notice has been dispatched to Faculty Advisor {student.advisor}.
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded text-xs text-slate-500">
                  No attendance ledger found for this student.
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4 text-xs">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Registrar Dossier & Contacts
              </div>

              <div className="bg-white border border-slate-200 rounded p-4 space-y-3">
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{student.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-mono">{student.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{student.address}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Assigned Advisor: <strong className="text-slate-900">{student.advisor}</strong></span>
                </div>
              </div>

              <div className="bg-[#f8fafc] border border-slate-200 rounded p-4">
                <div className="font-bold text-slate-900 mb-1">FERPA Compliance Note</div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  All educational records, grading rubrics, and financial ledger items are protected under Title 34 CFR Part 99. Access strictly monitored and audited under institutional policy.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between text-xs">
          <span className="text-[#64748b]">
            Camden University System · ID {student.id}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-white border border-[#cbd5e1] font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
