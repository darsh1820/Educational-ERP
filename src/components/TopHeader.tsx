import React, { useState } from 'react';
import {
  Search,
  Bell,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Menu,
  Shield,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import { ViewMode, AcademicTerm } from '../types/academic.ts';
import { OfficerPersona } from '../services/api.ts';

interface TopHeaderProps {
  currentView: ViewMode;
  selectedTerm: AcademicTerm;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenMobileMenu?: () => void;
  onQuickExport: () => void;
  activeOfficer: OfficerPersona;
  personas: OfficerPersona[];
  onSwitchPersona: (p: OfficerPersona) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentView,
  selectedTerm,
  searchQuery,
  onSearchChange,
  onOpenMobileMenu,
  onQuickExport,
  activeOfficer,
  personas,
  onSwitchPersona,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'Tuition Reconciliation Due',
      desc: '3 delinquent student invoices flagged for late-fee assessment.',
      time: '14m ago',
      type: 'warning',
    },
    {
      id: 2,
      title: 'Course CS-401 Final Grades Submitted',
      desc: 'Dr. Aris Thorne submitted grade roster for registrar validation.',
      time: '1h ago',
      type: 'success',
    },
    {
      id: 3,
      title: 'ABET Criteria 4 Audit Scheduled',
      desc: 'Institutional accreditation documentation requested by Dean.',
      time: '3h ago',
      type: 'info',
    },
  ];

  const viewTitles: Record<ViewMode, { section: string; title: string }> = {
    overview: {
      section: 'Registrar Operations',
      title: 'Institutional Performance & Executive Dashboard',
    },
    grades: {
      section: 'Curriculum & Examination',
      title: 'Grade Books & Academic Performance Matrix',
    },
    billing: {
      section: 'Bursar & Accounts',
      title: 'Multi-Tier Student Tuition Ledger & Reconciliation',
    },
    attendance: {
      section: 'Academic Engagement',
      title: 'Daily Attendance Matrix & Compliance Roster',
    },
    compliance: {
      section: 'Institutional Governance',
      title: 'Accreditation Standards & Compliance Audit',
    },
    students: {
      section: 'Student Affairs',
      title: 'Official Student Directory & Matriculation Records',
    },
    audit: {
      section: 'Cryptographic Security',
      title: 'Immutable SHA-256 Audit Trail & Chain Verification',
    },
  };

  const currentInfo = viewTitles[currentView];

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-[#e2e8f0] h-16 px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger + Contextual Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded text-slate-600 hover:bg-slate-100"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-[#64748b] leading-none mb-1">
            <span className="font-medium text-[#0f172a]">Camden University</span>
            <span>/</span>
            <span>{selectedTerm}</span>
            <span>/</span>
            <span className="text-[#2563eb] font-semibold">{currentInfo.section}</span>
          </div>
          <h1 className="text-base font-bold text-[#0f172a] font-display tracking-tight truncate">
            {currentInfo.title}
          </h1>
        </div>
      </div>

      {/* Right: Search + Notification Bell + Export Button + Persona Switcher */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Search Input */}
        <div className="relative hidden md:block w-52 lg:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, ID, ledger..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded h-9 pl-9 pr-3 text-xs text-[#0f172a] placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb]"
          />
        </div>

        {/* Export Data Action */}
        <button
          onClick={onQuickExport}
          className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded text-xs font-semibold bg-white border border-[#cbd5e1] text-[#0f172a] hover:bg-[#f8fafc] hover:border-[#94a3b8] transition-colors"
          title="Export current view data as CSV"
        >
          <Download className="w-3.5 h-3.5 text-[#64748b]" />
          <span>Export CSV</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Institutional Alerts"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-600" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#cbd5e1] rounded-lg shadow-lg z-50 p-3 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-[#0f172a] uppercase tracking-wide">
                  Administrative Alerts
                </span>
                <span
                  onClick={() => setShowNotifications(false)}
                  className="text-[10px] text-[#2563eb] font-semibold cursor-pointer hover:underline"
                >
                  Dismiss
                </span>
              </div>
              <div className="space-y-2">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 rounded bg-[#f8fafc] border border-slate-100 text-xs hover:bg-[#eff6ff] transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      {item.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-semibold text-slate-900 text-xs">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          {item.desc}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{item.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Multi-Role Persona Switcher (RBAC) */}
        <div className="relative">
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:opacity-90 transition-opacity"
            title="Switch User Persona & RBAC Role"
          >
            <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              {activeOfficer.avatarInitials}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-[#0f172a] leading-tight flex items-center gap-1">
                <span>{activeOfficer.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-[10px] text-[#2563eb] font-semibold leading-none flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" />
                <span>{activeOfficer.role}</span>
              </div>
            </div>
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-[#cbd5e1] rounded-lg shadow-xl z-50 p-3 animate-in fade-in slide-in-from-top-1">
              <div className="pb-2 border-b border-slate-100 mb-2">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#2563eb]" />
                  <span>Select Active Officer Persona</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Test and enforce Multi-Role RBAC access controls
                </p>
              </div>

              <div className="space-y-1.5">
                {personas.map((persona) => {
                  const isCurrent = persona.id === activeOfficer.id;
                  return (
                    <button
                      key={persona.id}
                      onClick={() => {
                        onSwitchPersona(persona);
                        setShowPersonaMenu(false);
                      }}
                      className={`w-full p-2 rounded text-left transition-colors flex items-center gap-2.5 ${
                        isCurrent
                          ? 'bg-[#eff6ff] border border-[#bfdbfe]'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {persona.avatarInitials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {persona.name}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                            {persona.role}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {persona.title}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                RBAC Token: Active HMAC-Signed
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
