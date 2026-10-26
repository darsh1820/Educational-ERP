import React, { useState } from 'react';
import {
  GraduationCap,
  Download,
  CheckCheck,
  Search,
  Filter,
  BarChart2,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { Course, CourseGradeRecord, Student } from '../types/academic';
import { calculateGrade } from '../data/mockData';
import { StatusBadge } from './StatusBadge';

interface GradeBookViewProps {
  courses: Course[];
  grades: CourseGradeRecord[];
  students: Student[];
  onUpdateGrade: (gradeId: string, updatedScores: Partial<CourseGradeRecord>) => void;
  onSelectStudent: (student: Student) => void;
}

export const GradeBookView: React.FC<GradeBookViewProps> = ({
  courses,
  grades,
  students,
  onUpdateGrade,
  onSelectStudent,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [standingFilter, setStandingFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    midterm: number;
    finalExam: number;
    practicum: number;
    continuous: number;
  }>({ midterm: 0, finalExam: 0, practicum: 0, continuous: 0 });

  // Filtered grades
  const filteredGrades = grades.filter((g) => {
    if (selectedCourseId !== 'all' && g.courseId !== selectedCourseId) return false;
    const student = students.find((s) => s.id === g.studentId);
    if (!student) return false;

    if (standingFilter !== 'all' && student.standing !== standingFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = student.name.toLowerCase().includes(q);
      const matchId = student.id.toLowerCase().includes(q);
      const matchCourse = g.courseCode.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchCourse) return false;
    }

    return true;
  });

  // Calculate statistics
  const currentGrades = filteredGrades;
  const avgWeightedScore =
    currentGrades.length > 0
      ? (currentGrades.reduce((acc, g) => acc + g.weightedTotal, 0) / currentGrades.length).toFixed(1)
      : '0.0';

  const gradeDistribution = {
    A: currentGrades.filter((g) => g.letterGrade.startsWith('A')).length,
    B: currentGrades.filter((g) => g.letterGrade.startsWith('B')).length,
    C: currentGrades.filter((g) => g.letterGrade.startsWith('C')).length,
    D: currentGrades.filter((g) => g.letterGrade === 'D').length,
    F: currentGrades.filter((g) => g.letterGrade === 'F').length,
  };

  const startEditing = (record: CourseGradeRecord) => {
    setEditingGradeId(record.id);
    setEditValues({
      midterm: record.midtermScore,
      finalExam: record.finalExamScore,
      practicum: record.practicumScore,
      continuous: record.continuousScore,
    });
  };

  const saveEditing = (recordId: string) => {
    const { weightedTotal, letterGrade } = calculateGrade(
      editValues.midterm,
      editValues.finalExam,
      editValues.practicum,
      editValues.continuous
    );

    onUpdateGrade(recordId, {
      midtermScore: editValues.midterm,
      finalExamScore: editValues.finalExam,
      practicumScore: editValues.practicum,
      continuousScore: editValues.continuous,
      weightedTotal,
      letterGrade,
      lastModified: new Date().toISOString().replace('T', ' ').slice(0, 16),
    });
    setEditingGradeId(null);
  };

  const applyCurve = () => {
    currentGrades.forEach((g) => {
      const newMidterm = Math.min(100, g.midtermScore + 2.5);
      const newFinal = Math.min(100, g.finalExamScore + 2.5);
      const { weightedTotal, letterGrade } = calculateGrade(
        newMidterm,
        newFinal,
        g.practicumScore,
        g.continuousScore
      );
      onUpdateGrade(g.id, {
        midtermScore: newMidterm,
        finalExamScore: newFinal,
        weightedTotal,
        letterGrade,
      });
    });
  };

  const publishAll = () => {
    currentGrades.forEach((g) => {
      onUpdateGrade(g.id, { status: 'Published' });
    });
  };

  const exportCSV = () => {
    const headers = [
      'Student ID',
      'Student Name',
      'Course Code',
      'Course Title',
      'Midterm (30%)',
      'Final (40%)',
      'Practicum (20%)',
      'Continuous (10%)',
      'Weighted Total',
      'Letter Grade',
      'Status',
    ];

    const rows = filteredGrades.map((g) => {
      const student = students.find((s) => s.id === g.studentId);
      return [
        g.studentId,
        student ? student.name : '',
        g.courseCode,
        `"${g.courseTitle}"`,
        g.midtermScore,
        g.finalExamScore,
        g.practicumScore,
        g.continuousScore,
        g.weightedTotal,
        g.letterGrade,
        g.status,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GradeBook_${selectedCourseId}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Action / Filter Bar */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Course Selector & Standing Filter */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Course Roster:
              </span>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                aria-label="Course Roster"
                className="bg-[#f8fafc] border border-[#cbd5e1] rounded px-3 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
              >
                <option value="all">All Academic Courses ({grades.length} Enrolled)</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.title} ({c.instructor})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Standing Filter:
              </span>
              <select
                value={standingFilter}
                onChange={(e) => setStandingFilter(e.target.value)}
                aria-label="Standing Filter"
                className="bg-[#f8fafc] border border-[#cbd5e1] rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
              >
                <option value="all">All Academic Standings</option>
                <option value="Dean's List">Dean's List</option>
                <option value="Good Standing">Good Standing</option>
                <option value="Honors Program">Honors Program</option>
                <option value="Academic Probation">Academic Probation (Alert)</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Search Roster:
              </span>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by student name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                />
              </div>
            </div>
          </div>

          {/* Quick Actions: Curve, Publish, Export */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0 pt-2 md:pt-0">
            <button
              onClick={applyCurve}
              title="Apply +2.5% standard institutional curve across exams"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-white border border-[#cbd5e1] text-[#7c3aed] hover:bg-[#f5f3ff] hover:border-[#ddd6fe] transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Apply Bell Curve (+2.5%)</span>
            </button>

            <button
              onClick={publishAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Publish All Marks</span>
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

        {/* Statistical Summary Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Cohort Average:</span>
              <span className="font-bold font-mono text-slate-900 tabular-nums">
                {avgWeightedScore}%
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <span>Weight Formula:</span>
              <span className="font-mono text-[11px] text-slate-700">
                Midterm 30% · Final 40% · Lab 20% · Continuous 10%
              </span>
            </div>
          </div>

          {/* Bell Curve Distribution Chips */}
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="text-[10px] text-slate-400 font-sans uppercase font-bold">Distribution:</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              A: {gradeDistribution.A}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              B: {gradeDistribution.B}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-200">
              C: {gradeDistribution.C}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              D: {gradeDistribution.D}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold border border-rose-200">
              F: {gradeDistribution.F}
            </span>
          </div>
        </div>
      </div>

      {/* High-Density Examination Grade Matrix */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-[#64748b] border-b border-[#cbd5e1] uppercase text-[10px] tracking-wider font-semibold select-none h-8">
              <tr>
                <th className="py-2 px-4">Student ID & Name</th>
                <th className="py-2 px-3">Course</th>
                <th className="py-2 px-2 text-right">Midterm (30%)</th>
                <th className="py-2 px-2 text-right">Final (40%)</th>
                <th className="py-2 px-2 text-right">Lab / Practicum (20%)</th>
                <th className="py-2 px-2 text-right">Continuous (10%)</th>
                <th className="py-2 px-3 text-right">Weighted Mark</th>
                <th className="py-2 px-2 text-center">Grade</th>
                <th className="py-2 px-3 text-center">Standing</th>
                <th className="py-2 px-3 text-center">Status</th>
                <th className="py-2 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filteredGrades.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    No academic examination records matched your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredGrades.map((record) => {
                  const student = students.find((s) => s.id === record.studentId);
                  const isEditing = editingGradeId === record.id;

                  return (
                    <tr
                      key={record.id}
                      className={`h-11 transition-colors ${
                        isEditing ? 'bg-[#eff6ff] border-l-2 border-[#2563eb]' : 'hover:bg-[#f8fafc]'
                      }`}
                    >
                      {/* Student Info */}
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

                      {/* Course */}
                      <td className="py-2 px-3">
                        <span className="font-mono font-medium text-slate-800">
                          {record.courseCode}
                        </span>
                      </td>

                      {/* Midterm Score */}
                      <td className="py-2 px-2 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={editValues.midterm}
                            onChange={(e) =>
                              setEditValues({ ...editValues, midterm: parseFloat(e.target.value) || 0 })
                            }
                            className="w-16 h-7 text-right font-mono bg-white border border-[#2563eb] rounded px-1 text-xs"
                          />
                        ) : (
                          <span className="font-mono tabular-nums text-slate-800">
                            {record.midtermScore.toFixed(1)}%
                          </span>
                        )}
                      </td>

                      {/* Final Exam Score */}
                      <td className="py-2 px-2 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={editValues.finalExam}
                            onChange={(e) =>
                              setEditValues({ ...editValues, finalExam: parseFloat(e.target.value) || 0 })
                            }
                            className="w-16 h-7 text-right font-mono bg-white border border-[#2563eb] rounded px-1 text-xs"
                          />
                        ) : (
                          <span className="font-mono tabular-nums text-slate-800">
                            {record.finalExamScore.toFixed(1)}%
                          </span>
                        )}
                      </td>

                      {/* Practicum Score */}
                      <td className="py-2 px-2 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={editValues.practicum}
                            onChange={(e) =>
                              setEditValues({ ...editValues, practicum: parseFloat(e.target.value) || 0 })
                            }
                            className="w-16 h-7 text-right font-mono bg-white border border-[#2563eb] rounded px-1 text-xs"
                          />
                        ) : (
                          <span className="font-mono tabular-nums text-slate-800">
                            {record.practicumScore.toFixed(1)}%
                          </span>
                        )}
                      </td>

                      {/* Continuous Score */}
                      <td className="py-2 px-2 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={editValues.continuous}
                            onChange={(e) =>
                              setEditValues({ ...editValues, continuous: parseFloat(e.target.value) || 0 })
                            }
                            className="w-16 h-7 text-right font-mono bg-white border border-[#2563eb] rounded px-1 text-xs"
                          />
                        ) : (
                          <span className="font-mono tabular-nums text-slate-800">
                            {record.continuousScore.toFixed(1)}%
                          </span>
                        )}
                      </td>

                      {/* Weighted Total */}
                      <td className="py-2 px-3 text-right">
                        <span className="font-mono font-bold tabular-nums text-slate-900 text-sm">
                          {isEditing
                            ? calculateGrade(
                                editValues.midterm,
                                editValues.finalExam,
                                editValues.practicum,
                                editValues.continuous
                              ).weightedTotal.toFixed(1)
                            : record.weightedTotal.toFixed(1)}
                          %
                        </span>
                      </td>

                      {/* Letter Grade */}
                      <td className="py-2 px-2 text-center">
                        <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-900 text-xs">
                          {isEditing
                            ? calculateGrade(
                                editValues.midterm,
                                editValues.finalExam,
                                editValues.practicum,
                                editValues.continuous
                              ).letterGrade
                            : record.letterGrade}
                        </span>
                      </td>

                      {/* Standing */}
                      <td className="py-2 px-3 text-center">
                        {student && (
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
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2 px-3 text-center">
                        <StatusBadge
                          label={record.status}
                          variant={record.status === 'Published' ? 'paid' : 'review'}
                          size="sm"
                        />
                      </td>

                      {/* Action */}
                      <td className="py-2 px-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => saveEditing(record.id)}
                              className="px-2 py-1 rounded bg-[#2563eb] text-white text-[11px] font-semibold hover:bg-[#1d4ed8]"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingGradeId(null)}
                              className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-[11px] hover:bg-slate-300"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditing(record)}
                            className="text-[#2563eb] hover:text-[#1d4ed8] font-semibold text-xs hover:underline"
                          >
                            Edit Marks
                          </button>
                        )}
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
            Displaying <strong className="text-slate-900">{filteredGrades.length}</strong> examination records
          </span>
          <span className="font-mono text-[11px]">
            Registrar Grade Lock: Active for Fall 2026 Assessment
          </span>
        </div>
      </div>
    </div>
  );
};
