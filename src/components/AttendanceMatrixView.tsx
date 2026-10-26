import React, { useState } from 'react';
import {
  CalendarCheck2,
  Check,
  Clock,
  AlertCircle,
  ShieldAlert,
  Download,
  Search,
  BellRing,
} from 'lucide-react';
import { AttendanceSummary, Student, AttendanceStatus } from '../types/academic';
import { StatusBadge } from './StatusBadge';

interface AttendanceMatrixViewProps {
  attendanceRecords: AttendanceSummary[];
  students: Student[];
  onUpdateAttendance: (studentId: string, status: AttendanceStatus) => void;
  onSelectStudent: (student: Student) => void;
}

export const AttendanceMatrixView: React.FC<AttendanceMatrixViewProps> = ({
  attendanceRecords,
  students,
  onUpdateAttendance,
  onSelectStudent,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-26');
  const [sessionPeriod, setSessionPeriod] = useState<string>('Period 2 (10:00 - 11:30 AM)');
  const [thresholdFilter, setThresholdFilter] = useState<'all' | 'alert' | 'optimal'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [todayMarks, setTodayMarks] = useState<Record<string, AttendanceStatus>>({
    'STU-90214': 'Present',
    'STU-90215': 'Present',
    'STU-90216': 'Excused',
    'STU-90217': 'Absent',
    'STU-90218': 'Present',
    'STU-90219': 'Late',
    'STU-90220': 'Present',
    'STU-90221': 'Present',
  });
  const [notifiedStudentId, setNotifiedStudentId] = useState<string | null>(null);

  const filteredRecords = attendanceRecords.filter((rec) => {
    const student = students.find((s) => s.id === rec.studentId);
    if (!student) return false;

    if (thresholdFilter === 'alert' && rec.rate >= 85) return false;
    if (thresholdFilter === 'optimal' && rec.rate < 90) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = student.name.toLowerCase().includes(q);
      const matchId = student.id.toLowerCase().includes(q);
      if (!matchName && !matchId) return false;
    }

    return true;
  });

  const markStudent = (studentId: string, status: AttendanceStatus) => {
    setTodayMarks((prev) => ({ ...prev, [studentId]: status }));
    onUpdateAttendance(studentId, status);
  };

  const markAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      updated[s.id] = 'Present';
      onUpdateAttendance(s.id, 'Present');
    });
    setTodayMarks(updated);
  };

  const sendInterventionNotice = (studentId: string) => {
    setNotifiedStudentId(studentId);
    setTimeout(() => setNotifiedStudentId(null), 2500);
  };

  const exportCSV = () => {
    const headers = [
      'Student ID',
      'Student Name',
      'Program',
      'Total Sessions',
      'Present Count',
      'Late Count',
      'Absent Count',
      'Excused Count',
      'Attendance Rate %',
      'Today Session Status',
    ];

    const rows = filteredRecords.map((r) => {
      const s = students.find((item) => item.id === r.studentId);
      return [
        r.studentId,
        s ? s.name : '',
        s ? `"${s.program}"` : '',
        r.totalSessions,
        r.presentCount,
        r.lateCount,
        r.absentCount,
        r.excusedCount,
        r.rate.toFixed(1),
        todayMarks[r.studentId] || 'Present',
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Attendance_Matrix_${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Session Controls & Actions */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Date & Period Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Classroom Date:
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                aria-label="Classroom Date"
                className="bg-[#f8fafc] border border-[#cbd5e1] rounded px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
              />
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Instructional Block:
              </span>
              <select
                value={sessionPeriod}
                onChange={(e) => setSessionPeriod(e.target.value)}
                aria-label="Instructional Block"
                className="bg-[#f8fafc] border border-[#cbd5e1] rounded px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
              >
                <option value="Period 1 (08:30 - 10:00 AM)">Period 1 (08:30 - 10:00 AM)</option>
                <option value="Period 2 (10:00 - 11:30 AM)">Period 2 (10:00 - 11:30 AM)</option>
                <option value="Period 3 (01:15 - 02:45 PM)">Period 3 (01:15 - 02:45 PM)</option>
                <option value="Period 4 (03:00 - 04:30 PM)">Period 4 (03:00 - 04:30 PM)</option>
              </select>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Rate Threshold:
              </span>
              <select
                value={thresholdFilter}
                onChange={(e) => setThresholdFilter(e.target.value as any)}
                aria-label="Rate Threshold"
                className="bg-[#f8fafc] border border-[#cbd5e1] rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
              >
                <option value="all">All Attendance Rates</option>
                <option value="alert">Attendance Alert (&lt;85%)</option>
                <option value="optimal">Optimal (≥90%)</option>
              </select>
            </div>

            <div className="flex-1 min-w-[180px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Search Roster:
              </span>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Student name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                />
              </div>
            </div>
          </div>

          {/* Quick Roll-Call Actions */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0 pt-2 md:pt-0">
            <button
              onClick={markAllPresent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark All Present</span>
            </button>
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-white border border-[#cbd5e1] text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Legend strip */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase font-bold text-slate-400">Classroom Code Legend:</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
              <span className="text-[11px]">Present</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]" />
              <span className="text-[11px]">Late / Tardy</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e11d48]" />
              <span className="text-[11px]">Unexcused Absent</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed]" />
              <span className="text-[11px]">Excused / Medical</span>
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            Institutional Minimum Adherence Standard: 85.0%
          </div>
        </div>
      </div>

      {/* Daily Attendance Matrix Data Table */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-[#64748b] border-b border-[#cbd5e1] uppercase text-[10px] tracking-wider font-semibold select-none h-8">
              <tr>
                <th className="py-2 px-4">Student ID & Name</th>
                <th className="py-2 px-3">Academic Program</th>
                <th className="py-2 px-3 text-right">Term Rate</th>
                <th className="py-2 px-2 text-center">Present</th>
                <th className="py-2 px-2 text-center">Tardy</th>
                <th className="py-2 px-2 text-center">Absent</th>
                <th className="py-2 px-3 text-center">Today Session Status</th>
                <th className="py-2 px-3 text-center">Intervention State</th>
                <th className="py-2 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filteredRecords.map((record) => {
                const student = students.find((s) => s.id === record.studentId);
                const currentMark = todayMarks[record.studentId] || 'Present';
                const hasWarning = record.requiresIntervention;

                return (
                  <tr
                    key={record.studentId}
                    className={`h-11 transition-colors ${
                      hasWarning ? 'bg-[#fff1f2]/20 hover:bg-[#fff1f2]/40' : 'hover:bg-[#f8fafc]'
                    }`}
                  >
                    {/* Student */}
                    <td className="py-2 px-4">
                      <button
                        onClick={() => student && onSelectStudent(student)}
                        className="text-left group"
                      >
                        <div className="font-semibold text-slate-900 group-hover:text-[#2563eb] transition-colors">
                          {student?.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {record.studentId}
                        </div>
                      </button>
                    </td>

                    {/* Program */}
                    <td className="py-2 px-3 text-slate-600 truncate max-w-[160px]">
                      {student?.program}
                    </td>

                    {/* Term Rate */}
                    <td className="py-2 px-3 text-right font-mono font-bold tabular-nums">
                      <span
                        className={
                          record.rate >= 90
                            ? 'text-[#047857]'
                            : record.rate >= 80
                            ? 'text-[#b45309]'
                            : 'text-[#be123c]'
                        }
                      >
                        {record.rate.toFixed(1)}%
                      </span>
                    </td>

                    {/* Counts */}
                    <td className="py-2 px-2 text-center font-mono tabular-nums text-slate-700">
                      {record.presentCount}
                    </td>
                    <td className="py-2 px-2 text-center font-mono tabular-nums text-amber-700">
                      {record.lateCount}
                    </td>
                    <td className="py-2 px-2 text-center font-mono tabular-nums text-rose-700">
                      {record.absentCount}
                    </td>

                    {/* Today Session Status Quick Toggles */}
                    <td className="py-2 px-3 text-center">
                      <div className="inline-flex items-center p-0.5 rounded bg-slate-100 border border-slate-200">
                        <button
                          onClick={() => markStudent(record.studentId, 'Present')}
                          title="Mark Present"
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-colors ${
                            currentMark === 'Present'
                              ? 'bg-[#ecfdf5] text-[#047857] shadow-sm font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          P
                        </button>
                        <button
                          onClick={() => markStudent(record.studentId, 'Late')}
                          title="Mark Late"
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-colors ${
                            currentMark === 'Late'
                              ? 'bg-[#fffbeb] text-[#b45309] shadow-sm font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          L
                        </button>
                        <button
                          onClick={() => markStudent(record.studentId, 'Absent')}
                          title="Mark Absent"
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-colors ${
                            currentMark === 'Absent'
                              ? 'bg-[#fff1f2] text-[#be123c] shadow-sm font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          A
                        </button>
                        <button
                          onClick={() => markStudent(record.studentId, 'Excused')}
                          title="Mark Excused"
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-colors ${
                            currentMark === 'Excused'
                              ? 'bg-[#f5f3ff] text-[#6d28d9] shadow-sm font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          E
                        </button>
                      </div>
                    </td>

                    {/* Status Chip */}
                    <td className="py-2 px-3 text-center">
                      <StatusBadge
                        label={record.rate >= 90 ? 'Optimal' : record.rate >= 80 ? 'Review' : 'Warning'}
                        variant={record.rate >= 90 ? 'optimal' : record.rate >= 80 ? 'review' : 'absent'}
                        size="sm"
                      />
                    </td>

                    {/* Action */}
                    <td className="py-2 px-4 text-right">
                      {record.requiresIntervention ? (
                        <button
                          onClick={() => sendInterventionNotice(record.studentId)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#fff1f2] border border-[#fecdd3] text-[#be123c] text-[11px] font-semibold hover:bg-rose-100 transition-colors"
                        >
                          <BellRing className="w-3 h-3" />
                          <span>
                            {notifiedStudentId === record.studentId ? 'Dispatched' : 'Notify Dean'}
                          </span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Regular</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-2.5 bg-[#f8fafc] border-t border-[#cbd5e1] flex items-center justify-between text-xs text-[#64748b]">
          <span>
            Daily Roll-Call Session: <strong className="text-slate-900">{sessionPeriod}</strong> on {selectedDate}
          </span>
          <span className="font-mono text-[11px]">
            Institutional Census Attendance Log: Synchronized
          </span>
        </div>
      </div>
    </div>
  );
};
