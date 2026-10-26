import React, { useState } from 'react';
import {
  Users,
  Search,
  Download,
  Filter,
  GraduationCap,
  Eye,
  FileText,
} from 'lucide-react';
import { Student, FacultyDepartment, StudentStanding } from '../types/academic';
import { StatusBadge } from './StatusBadge';

interface StudentDirectoryViewProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
}

export const StudentDirectoryView: React.FC<StudentDirectoryViewProps> = ({
  students,
  onSelectStudent,
}) => {
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [standingFilter, setStandingFilter] = useState<string>('all');
  const [residencyFilter, setResidencyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredStudents = students.filter((s) => {
    if (departmentFilter !== 'all' && s.department !== departmentFilter) return false;
    if (standingFilter !== 'all' && s.standing !== standingFilter) return false;
    if (residencyFilter !== 'all' && s.residency !== residencyFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchId = s.id.toLowerCase().includes(q);
      const matchEmail = s.email.toLowerCase().includes(q);
      const matchProgram = s.program.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchEmail && !matchProgram) return false;
    }

    return true;
  });

  const exportCSV = () => {
    const headers = [
      'Student ID',
      'Full Name',
      'Email',
      'Department',
      'Program',
      'Cohort Year',
      'GPA',
      'Credits Completed',
      'Total Credits Required',
      'Standing',
      'Residency',
      'Advisor',
    ];

    const rows = filteredStudents.map((s) =>
      [
        s.id,
        `"${s.name}"`,
        s.email,
        `"${s.department}"`,
        `"${s.program}"`,
        s.cohortYear,
        s.gpa.toFixed(2),
        s.creditsCompleted,
        s.totalCreditsRequired,
        `"${s.standing}"`,
        s.residency,
        `"${s.advisor}"`,
      ].join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Student_Directory_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Directory Filter Strip */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                College / Faculty:
              </span>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                aria-label="College / Faculty"
                className="bg-[#f8fafc] border border-[#cbd5e1] rounded px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
              >
                <option value="all">All Academic Faculties</option>
                <option value="Engineering & Computer Science">Engineering & Computer Science</option>
                <option value="School of Business">School of Business</option>
                <option value="Natural & Health Sciences">Natural & Health Sciences</option>
                <option value="Humanities & Social Sciences">Humanities & Social Sciences</option>
                <option value="School of Law">School of Law</option>
              </select>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Standing:
              </span>
              <select
                value={standingFilter}
                onChange={(e) => setStandingFilter(e.target.value)}
                aria-label="Standing"
                className="bg-[#f8fafc] border border-[#cbd5e1] rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
              >
                <option value="all">All Standings</option>
                <option value="Dean's List">Dean's List</option>
                <option value="Good Standing">Good Standing</option>
                <option value="Honors Program">Honors Program</option>
                <option value="Academic Probation">Academic Probation</option>
              </select>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Residency:
              </span>
              <select
                value={residencyFilter}
                onChange={(e) => setResidencyFilter(e.target.value)}
                aria-label="Residency"
                className="bg-[#f8fafc] border border-[#cbd5e1] rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
              >
                <option value="all">All Residencies</option>
                <option value="In-State">In-State</option>
                <option value="Out-of-State">Out-of-State</option>
                <option value="International">International</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Search Students:
              </span>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter name, student ID, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto shrink-0 pt-2 md:pt-0">
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-white border border-[#cbd5e1] text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Roster CSV</span>
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Active Student Records Found: <strong className="text-slate-900">{filteredStudents.length}</strong>
          </span>
          <span className="font-mono text-[11px]">
            FERPA Privacy Flag: Confidential Educational Records
          </span>
        </div>
      </div>

      {/* High-Density Student Records Table */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-[#64748b] border-b border-[#cbd5e1] uppercase text-[10px] tracking-wider font-semibold select-none h-8">
              <tr>
                <th className="py-2 px-4">Student ID & Full Name</th>
                <th className="py-2 px-4">Program & College</th>
                <th className="py-2 px-2 text-center">Cohort</th>
                <th className="py-2 px-3 text-right">Cumulative GPA</th>
                <th className="py-2 px-3 text-right">Degree Credits</th>
                <th className="py-2 px-3 text-center">Standing</th>
                <th className="py-2 px-3">Residency</th>
                <th className="py-2 px-3">Faculty Advisor</th>
                <th className="py-2 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No student matriculation records matched your query.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const isProbation = s.standing === 'Academic Probation';

                  return (
                    <tr
                      key={s.id}
                      className={`h-12 transition-colors ${
                        isProbation ? 'bg-[#fff1f2]/20 hover:bg-[#fff1f2]/40' : 'hover:bg-[#f8fafc]'
                      }`}
                    >
                      {/* ID and Name */}
                      <td className="py-2 px-4">
                        <button
                          onClick={() => onSelectStudent(s)}
                          className="flex items-center gap-2.5 text-left group"
                        >
                          <div className="w-7 h-7 rounded bg-[#2563eb] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {s.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-[#2563eb] transition-colors">
                              {s.name}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">
                              {s.id} · {s.email}
                            </div>
                          </div>
                        </button>
                      </td>

                      {/* Program */}
                      <td className="py-2 px-4">
                        <div className="font-medium text-slate-900">{s.program}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                          {s.department}
                        </div>
                      </td>

                      {/* Cohort Year */}
                      <td className="py-2 px-2 text-center font-mono tabular-nums text-slate-700">
                        {s.cohortYear}
                      </td>

                      {/* GPA */}
                      <td className="py-2 px-3 text-right font-mono font-bold tabular-nums text-slate-900">
                        {s.gpa.toFixed(2)}
                      </td>

                      {/* Credits */}
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-700">
                        {s.creditsCompleted} <span className="text-slate-400">/ {s.totalCreditsRequired}</span>
                      </td>

                      {/* Standing */}
                      <td className="py-2 px-3 text-center">
                        <StatusBadge
                          label={s.standing}
                          variant={
                            s.standing === "Dean's List" || s.standing === 'Honors Program'
                              ? 'deans-list'
                              : s.standing === 'Academic Probation'
                              ? 'probation'
                              : 'optimal'
                          }
                          size="sm"
                        />
                      </td>

                      {/* Residency */}
                      <td className="py-2 px-3 text-slate-700">
                        {s.residency}
                      </td>

                      {/* Advisor */}
                      <td className="py-2 px-3 text-slate-700 truncate max-w-[140px]">
                        {s.advisor}
                      </td>

                      {/* Action */}
                      <td className="py-2 px-4 text-right">
                        <button
                          onClick={() => onSelectStudent(s)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#eff6ff] text-[#2563eb] font-semibold text-xs hover:bg-[#dbeafe] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Dossier</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-2.5 bg-[#f8fafc] border-t border-[#cbd5e1] flex items-center justify-between text-xs text-[#64748b]">
          <span>
            Total Enrolled Roster: <strong className="text-slate-900">{students.length}</strong> Students
          </span>
          <span className="font-mono text-[11px]">
            University Registrar Central Index
          </span>
        </div>
      </div>
    </div>
  );
};
