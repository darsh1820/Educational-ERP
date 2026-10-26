import React, { useState } from 'react';
import {
  ShieldCheck,
  Download,
  AlertTriangle,
  RefreshCw,
  Building,
  CheckCircle2,
  FileCheck2,
} from 'lucide-react';
import { ComplianceStandard, AcademicTerm } from '../types/academic';
import { StatusBadge } from './StatusBadge';

interface ComplianceViewProps {
  standards: ComplianceStandard[];
  term: AcademicTerm;
  onOpenAuditModal: () => void;
  onRefreshAudit: () => void;
}

export const ComplianceView: React.FC<ComplianceViewProps> = ({
  standards,
  term,
  onOpenAuditModal,
  onRefreshAudit,
}) => {
  const [governingFilter, setGoverningFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isVerifying, setIsVerifying] = useState(false);

  const filteredStandards = standards.filter((s) => {
    if (governingFilter !== 'all' && s.governingBody !== governingFilter) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    return true;
  });

  const handleRunVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onRefreshAudit();
    }, 1200);
  };

  const compliantCount = standards.filter((s) => s.status === 'Compliant').length;
  const inReviewCount = standards.filter((s) => s.status === 'In Review').length;
  const totalFindings = standards.reduce((acc, s) => acc + s.openFindingsCount, 0);

  return (
    <div className="space-y-4">
      {/* Top Accreditation Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Institutional Standing
          </div>
          <div className="text-xl font-bold text-[#059669] font-display">
            Full Accreditation
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Tier-1 Research University
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Fully Compliant Standards
          </div>
          <div className="text-2xl font-bold font-mono text-[#0f172a] tabular-nums">
            {compliantCount} <span className="text-sm font-normal text-slate-400">/ {standards.length}</span>
          </div>
          <div className="text-xs text-emerald-700 font-semibold mt-1">
            {((compliantCount / standards.length) * 100).toFixed(0)}% verified
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Standards Under Review
          </div>
          <div className="text-2xl font-bold font-mono text-[#b45309] tabular-nums">
            {inReviewCount}
          </div>
          <div className="text-xs text-amber-700 mt-1">
            Title IV Census Re-verification
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Statutory Open Findings
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {totalFindings}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Remediation cycle in progress
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Governing Body:
            </span>
            <select
              value={governingFilter}
              onChange={(e) => setGoverningFilter(e.target.value)}
              aria-label="Governing Body"
              className="bg-[#f8fafc] border border-[#cbd5e1] rounded px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
            >
              <option value="all">All Accreditation Bodies</option>
              <option value="ABET">ABET (Engineering & Technology)</option>
              <option value="Higher Learning Commission">HLC (Higher Learning Commission)</option>
              <option value="Dept of Education">Dept of Education (Title IV)</option>
              <option value="FERPA">FERPA (Student Record Privacy)</option>
            </select>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Verification State:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Verification State"
              className="bg-[#f8fafc] border border-[#cbd5e1] rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
            >
              <option value="all">All Verification States</option>
              <option value="Compliant">Compliant</option>
              <option value="In Review">In Review</option>
              <option value="Action Required">Action Required</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunVerification}
            disabled={isVerifying}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-white border border-[#cbd5e1] text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin text-[#2563eb]' : 'text-slate-500'}`} />
            <span>{isVerifying ? 'Auditing Records...' : 'Re-verify Criteria'}</span>
          </button>
          <button
            onClick={onOpenAuditModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Official Audit Package</span>
          </button>
        </div>
      </div>

      {/* Accreditation Matrix Grid */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-[#64748b] border-b border-[#cbd5e1] uppercase text-[10px] tracking-wider font-semibold select-none h-8">
              <tr>
                <th className="py-2 px-4">Standard Code</th>
                <th className="py-2 px-3">Governing Body</th>
                <th className="py-2 px-4">Accreditation Criterion & Scope</th>
                <th className="py-2 px-3 text-right">Compliance Score</th>
                <th className="py-2 px-3 text-center">Open Findings</th>
                <th className="py-2 px-3 text-center">Status</th>
                <th className="py-2 px-3">Lead Auditor</th>
                <th className="py-2 px-4 text-right">Renewal Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filteredStandards.map((std) => (
                <tr key={std.id} className="hover:bg-[#f8fafc] h-12 transition-colors">
                  <td className="py-2 px-4 font-mono font-bold text-slate-900">
                    {std.code}
                  </td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 text-slate-700">
                      {std.governingBody}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    <div className="font-semibold text-slate-900">{std.title}</div>
                    <div className="text-[11px] text-slate-500 leading-tight truncate max-w-sm">
                      {std.description}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold tabular-nums">
                    <span
                      className={
                        std.complianceRate >= 95
                          ? 'text-[#047857]'
                          : std.complianceRate >= 90
                          ? 'text-[#b45309]'
                          : 'text-[#be123c]'
                      }
                    >
                      {std.complianceRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center font-mono tabular-nums">
                    {std.openFindingsCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fffbeb] text-[#b45309] border border-[#fde68a]">
                        {std.openFindingsCount} items
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Zero</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <StatusBadge
                      label={std.status}
                      variant={std.status === 'Compliant' ? 'compliant' : 'review'}
                      size="sm"
                    />
                  </td>
                  <td className="py-2 px-3 text-slate-700">
                    {std.leadOfficer}
                  </td>
                  <td className="py-2 px-4 text-right font-mono text-[11px] text-slate-600">
                    {std.nextRenewalDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-2.5 bg-[#f8fafc] border-t border-[#cbd5e1] flex items-center justify-between text-xs text-[#64748b]">
          <span>
            Institutional Regulatory Registry · Last Automated Verification: {new Date().toLocaleDateString()}
          </span>
          <span className="font-mono text-[11px]">
            Federal Regulatory Authorization: Certified Current
          </span>
        </div>
      </div>
    </div>
  );
};
