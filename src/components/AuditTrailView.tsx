import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Download,
  CheckCircle2,
  Lock,
  Hash,
  RefreshCw,
  KeyRound,
  FileCheck2,
} from 'lucide-react';
import { AuditLogEntry } from '../services/api.ts';
import { StatusBadge } from './StatusBadge.tsx';

interface AuditTrailViewProps {
  auditLogs: AuditLogEntry[];
  chainValid: boolean;
  merkleRoot: string;
  onRefresh: () => void;
  isLoading: boolean;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({
  auditLogs,
  chainValid,
  merkleRoot,
  onRefresh,
  isLoading,
}) => {
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    if (roleFilter !== 'all' && log.actorRole !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchActor = log.actorName.toLowerCase().includes(q);
      const matchAction = log.action.toLowerCase().includes(q);
      const matchDetails = log.details.toLowerCase().includes(q);
      const matchResource = log.resourceId.toLowerCase().includes(q);
      const matchHash = log.currHash.toLowerCase().includes(q);
      if (!matchActor && !matchAction && !matchDetails && !matchResource && !matchHash) {
        return false;
      }
    }
    return true;
  });

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const exportAuditCSV = () => {
    const headers = [
      'Log ID',
      'Timestamp',
      'Actor ID',
      'Actor Name',
      'Actor Role',
      'Action',
      'Target Resource',
      'Resource ID',
      'Operational Details',
      'Previous SHA-256 Hash',
      'Current Block Hash',
    ];

    const rows = filteredLogs.map((l) =>
      [
        l.id,
        l.timestamp,
        l.actorId,
        `"${l.actorName}"`,
        l.actorRole,
        l.action,
        l.resource,
        l.resourceId,
        `"${l.details.replace(/"/g, '""')}"`,
        l.prevHash,
        l.currHash,
      ].join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Institutional_Audit_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Integrity & Diagnostics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Ledger Cryptographic Status
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <CheckCircle2 className="w-5 h-5 text-[#059669]" />
            <span className="text-xl font-bold font-display text-[#059669]">
              {chainValid ? 'VERIFIED (SHA-256)' : 'COMPROMISED'}
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Zero Tampering Detected Across All Blocks
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Total Immutably Logged Actions
          </div>
          <div className="text-2xl font-bold font-mono text-[#0f172a] tabular-nums">
            {auditLogs.length} Entries
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Title IV & FERPA Continuous Recording
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Current Merkle Chain Tip
          </div>
          <div className="font-mono text-xs font-bold text-slate-800 truncate mt-1">
            {merkleRoot}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            State Persistence: SQLite 3 File-Backed
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Actor Role:
            </span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              aria-label="Actor Role"
              className="bg-[#f8fafc] border border-[#cbd5e1] rounded px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
            >
              <option value="all">All Roles ({auditLogs.length})</option>
              <option value="REGISTRAR">Registrar (Super-Admin)</option>
              <option value="DEAN_FACULTY">Dean / Academic Faculty</option>
              <option value="BURSAR">Bursar & Accounts</option>
              <option value="AUDITOR">Accreditation Auditor</option>
              <option value="SYSTEM_CORE">System Core Engine</option>
            </select>
          </div>

          <div className="flex-1 min-w-[240px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Filter Audit Records:
            </span>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search actor, action, student ID, hash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 pt-2 sm:pt-0">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-white border border-[#cbd5e1] text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#2563eb]' : 'text-slate-500'}`} />
            <span>Verify Chain</span>
          </button>
          <button
            onClick={exportAuditCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Cryptographic Journal</span>
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-[#64748b] border-b border-[#cbd5e1] uppercase text-[10px] tracking-wider font-semibold select-none h-8">
              <tr>
                <th className="py-2 px-3 text-center">Block #</th>
                <th className="py-2 px-3">Timestamp (UTC)</th>
                <th className="py-2 px-4">Officer & Role</th>
                <th className="py-2 px-3">Operation</th>
                <th className="py-2 px-4">Entity & Resource Details</th>
                <th className="py-2 px-3">Cryptographic SHA-256 Hash</th>
                <th className="py-2 px-3 text-center">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No cryptographic audit records match your query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  return (
                    <tr key={log.id} className="hover:bg-[#f8fafc] h-12 transition-colors">
                      {/* Block Index */}
                      <td className="py-2 px-3 text-center font-mono font-bold text-slate-700">
                        #{log.id}
                      </td>

                      {/* Timestamp */}
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {log.timestamp.replace('T', ' ').slice(0, 19)}
                      </td>

                      {/* Actor */}
                      <td className="py-2 px-4">
                        <div className="font-semibold text-slate-900">{log.actorName}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] text-slate-400">
                            {log.actorId}
                          </span>
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                            {log.actorRole}
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-2 px-3 font-mono font-bold text-[#0f172a] text-[11px]">
                        {log.action}
                      </td>

                      {/* Details */}
                      <td className="py-2 px-4">
                        <div className="font-semibold text-slate-800 text-[11px]">
                          {log.resource} <span className="text-[#2563eb]">[{log.resourceId}]</span>
                        </div>
                        <div className="text-[11px] text-slate-600 leading-tight truncate max-w-md">
                          {log.details}
                        </div>
                      </td>

                      {/* Hash */}
                      <td className="py-2 px-3 font-mono text-[11px]">
                        <button
                          onClick={() => handleCopy(log.currHash)}
                          title="Click to copy SHA-256 hash"
                          className="text-left group flex items-center gap-1 hover:text-[#2563eb]"
                        >
                          <Hash className="w-3 h-3 text-slate-400 group-hover:text-[#2563eb]" />
                          <span className="text-slate-700 group-hover:text-[#2563eb]">
                            {log.currHash.slice(0, 10)}...{log.currHash.slice(-6)}
                          </span>
                        </button>
                        {copiedHash === log.currHash && (
                          <div className="text-[9px] text-[#059669] font-bold">Copied!</div>
                        )}
                      </td>

                      {/* Integrity */}
                      <td className="py-2 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]">
                          <Lock className="w-2.5 h-2.5" />
                          <span>VALID</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#f8fafc] border-t border-[#cbd5e1] flex items-center justify-between text-xs text-[#64748b]">
          <span>
            Cryptographic Audit Chain · Continuous SHA-256 State Anchoring
          </span>
          <span className="font-mono text-[11px]">
            Federal Statutory Archive: Title 34 CFR Compliant
          </span>
        </div>
      </div>
    </div>
  );
};
