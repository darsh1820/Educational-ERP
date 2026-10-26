import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  CreditCard,
  CalendarCheck2,
  ShieldCheck,
  Users,
  ChevronLeft,
  ChevronRight,
  Building2,
  FileSpreadsheet,
  KeyRound,
  Database,
} from 'lucide-react';
import { ViewMode, AcademicTerm, FacultyDepartment } from '../types/academic';

interface SidebarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  selectedTerm: AcademicTerm;
  onChangeTerm: (term: AcademicTerm) => void;
  selectedDepartment: FacultyDepartment;
  onChangeDepartment: (dept: FacultyDepartment) => void;
  pendingBillingCount: number;
  probationStudentCount: number;
  openFindingsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  collapsed,
  onToggleCollapse,
  selectedTerm,
  onChangeTerm,
  selectedDepartment,
  onChangeDepartment,
  pendingBillingCount,
  probationStudentCount,
  openFindingsCount,
}) => {
  const navItems = [
    {
      id: 'overview' as ViewMode,
      label: 'Institutional Overview',
      shortLabel: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'grades' as ViewMode,
      label: 'Grade Books & Exams',
      shortLabel: 'Grades',
      icon: GraduationCap,
      badge: { text: 'Curriculum', color: 'bg-[#f5f3ff] text-[#6d28d9] border border-[#ddd6fe]' },
    },
    {
      id: 'billing' as ViewMode,
      label: 'Tuition & Multi-Tier Billing',
      shortLabel: 'Billing',
      icon: CreditCard,
      badge: pendingBillingCount > 0 ? { text: `${pendingBillingCount}`, color: 'bg-[#fffbeb] text-[#b45309]' } : null,
    },
    {
      id: 'attendance' as ViewMode,
      label: 'Attendance Matrix',
      shortLabel: 'Attendance',
      icon: CalendarCheck2,
      badge: null,
    },
    {
      id: 'compliance' as ViewMode,
      label: 'Accreditation & Audit',
      shortLabel: 'Compliance',
      icon: ShieldCheck,
      badge: openFindingsCount > 0 ? { text: `${openFindingsCount} audit`, color: 'bg-[#fff1f2] text-[#be123c]' } : null,
    },
    {
      id: 'students' as ViewMode,
      label: 'Student Directory & Records',
      shortLabel: 'Directory',
      icon: Users,
      badge: probationStudentCount > 0 ? { text: `${probationStudentCount} alert`, color: 'bg-[#fff1f2] text-[#be123c]' } : null,
    },
    {
      id: 'audit' as ViewMode,
      label: 'Cryptographic Audit Trail',
      shortLabel: 'Audit',
      icon: KeyRound,
      badge: { text: 'SHA-256', color: 'bg-[#ecfdf5] text-[#047857]' },
    },
  ];

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-30 bg-[#0f172a] text-slate-300 flex flex-col transition-all duration-200 border-r border-slate-800 select-none ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800/80 justify-between">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded bg-[#2563eb] text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
              AP
            </div>
            <div className="truncate">
              <div className="text-sm font-bold text-white tracking-tight font-display truncate">
                Academic Precision
              </div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider truncate">
                Registrar & Governance
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-9 h-9 rounded bg-[#2563eb] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              AP
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className={`text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors ${
            collapsed ? 'hidden' : 'block'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Institutional Context Controls (Expanded Mode Only) */}
      {!collapsed && (
        <div className="p-3 border-b border-slate-800/80 space-y-2 bg-slate-900/40">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Active Term
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => onChangeTerm(e.target.value as AcademicTerm)}
              aria-label="Active Term"
              className="w-full bg-slate-800 border border-slate-700 rounded text-xs text-white px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
            >
              <option value="Fall 2026">Fall 2026 (Active Term)</option>
              <option value="Spring 2027">Spring 2027 (Registration)</option>
              <option value="Summer 2026">Summer 2026 (Archived)</option>
              <option value="Academic Year 2026-27">Full AY 2026-27</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Faculty / College
            </label>
            <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedDepartment}
                onChange={(e) => onChangeDepartment(e.target.value as FacultyDepartment)}
                aria-label="Faculty / College"
                className="bg-transparent text-xs text-white w-full focus:outline-none truncate"
              >
                <option value="All Departments" className="bg-slate-900 text-white">All University Faculties</option>
                <option value="Engineering & Computer Science" className="bg-slate-900 text-white">Engineering & CS</option>
                <option value="School of Business" className="bg-slate-900 text-white">School of Business</option>
                <option value="Natural & Health Sciences" className="bg-slate-900 text-white">Natural & Health Sci</option>
                <option value="Humanities & Social Sciences" className="bg-slate-900 text-white">Humanities & Social</option>
                <option value="School of Law" className="bg-slate-900 text-white">School of Law</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Nav List */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center rounded text-left transition-colors duration-150 relative ${
                collapsed ? 'justify-center p-2.5' : 'px-3 py-2 gap-3 text-xs font-medium'
              } ${
                isActive
                  ? 'bg-[#2563eb] text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`shrink-0 ${collapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
              {!collapsed && (
                <>
                  <span className="truncate flex-1">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${item.badge.color}`}
                    >
                      {item.badge.text}
                    </span>
                  )}
                </>
              )}

              {/* Collapsed dot for badge */}
              {collapsed && item.badge && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / System Health */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400">
        {collapsed ? (
          <button
            onClick={onToggleCollapse}
            className="w-full flex justify-center py-1 text-slate-400 hover:text-white"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider">
              <span>Audit State</span>
              <span className="text-emerald-400 font-semibold font-mono">VERIFIED</span>
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              Camden University Network
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <Database className="w-3 h-3 text-[#2563eb]" />
              <span>SQLite 3 (Persistent)</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
