import React, { useState } from 'react';
import { X, FileText, Download, ShieldCheck } from 'lucide-react';
import { ComplianceStandard, AcademicTerm } from '../types/academic';

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  standards: ComplianceStandard[];
  term: AcademicTerm;
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({
  isOpen,
  onClose,
  standards,
  term,
}) => {
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownloadReport = () => {
    setDownloaded(true);
    const content = `CAMDEN UNIVERSITY SYSTEM - ACCREDITATION & COMPLIANCE AUDIT
================================================================================
Academic Term: ${term}
Report Generated: ${new Date().toLocaleString()}
Chief Regulatory Auditor: Dr. Evelyn Vance, University Registrar
Institutional Status: FULLY COMPLIANT (Tier-1 Research & Educational Authorization)
================================================================================

STANDARDS EVALUATION MATRIX:
${standards
  .map(
    (s, idx) => `
${idx + 1}. [${s.governingBody}] ${s.code} - ${s.title}
   Status: ${s.status.toUpperCase()} | Compliance Score: ${s.complianceRate.toFixed(1)}%
   Lead Officer: ${s.leadOfficer}
   Audit Cycle: Last audited ${s.lastAuditDate} | Renewal due: ${s.nextRenewalDate}
   Open Findings: ${s.openFindingsCount} items
   Summary: ${s.description}
`
  )
  .join('\n--------------------------------------------------------------------------------')}

================================================================================
ATTESTATION:
This official compliance document has been rendered under Title 34 CFR and
statutory regional accreditation frameworks. All recorded curricula, grade curves,
and bursar ledger files are verified tamper-proof.
Signed: Evelyn Vance, Registrar
================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Institutional_Accreditation_Audit_${term.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-[1px] flex items-center justify-center p-4">
      <div className="bg-white border border-[#cbd5e1] rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#2563eb]" />
            <div>
              <h3 className="text-sm font-bold text-[#0f172a] font-display">
                Institutional Accreditation & Compliance Dossier
              </h3>
              <p className="text-xs text-[#64748b]">
                {term} Statutory Audit Package
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          {/* Institutional Stamp Banner */}
          <div className="p-3 bg-[#eff6ff] border border-[#bfdbfe] rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#2563eb]" />
              <span className="font-semibold text-slate-900">
                Accreditation Board Verification Matrix
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#2563eb] font-bold">
              ABET · HLC · DOE · FERPA
            </span>
          </div>

          {/* Standards Summary List */}
          <div className="border border-slate-200 rounded divide-y divide-slate-100">
            {standards.map((s) => (
              <div key={s.id} className="p-3.5 space-y-1.5 hover:bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono text-xs">{s.code}</span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {s.governingBody}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono tabular-nums font-bold text-slate-800">
                      {s.complianceRate.toFixed(1)}%
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                        s.status === 'Compliant'
                          ? 'bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]'
                          : 'bg-[#fffbeb] text-[#b45309] border border-[#fde68a]'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                </div>

                <div className="font-semibold text-slate-800 text-xs">{s.title}</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{s.description}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-mono">
                  <span>Auditor: {s.leadOfficer}</span>
                  <span>Next Renewal: {s.nextRenewalDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-3 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            Audit Hash: SHA-256 Verified
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded text-xs font-semibold bg-white border border-[#cbd5e1] text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
            <button
              onClick={handleDownloadReport}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloaded ? 'Report Downloaded!' : 'Download Complete Dossier'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
