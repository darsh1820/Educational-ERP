import React, { useState } from 'react';
import {
  CreditCard,
  Download,
  Plus,
  Search,
  FileCheck,
} from 'lucide-react';
import { BillingRecord, Student } from '../types/academic';
import { StatusBadge } from './StatusBadge';

interface BillingLedgerViewProps {
  billingRecords: BillingRecord[];
  students: Student[];
  onOpenPaymentModal: () => void;
  onSelectStudent: (student: Student) => void;
}

export const BillingLedgerView: React.FC<BillingLedgerViewProps> = ({
  billingRecords,
  students,
  onOpenPaymentModal,
  onSelectStudent,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [noticeSentId, setNoticeSentId] = useState<string | null>(null);

  // Filter records
  const filteredRecords = billingRecords.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (tierFilter !== 'all' && !b.tier.includes(tierFilter)) return false;

    const student = students.find((s) => s.id === b.studentId);
    if (!student) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = student.name.toLowerCase().includes(q);
      const matchInvoice = b.invoiceNumber.toLowerCase().includes(q);
      const matchId = student.id.toLowerCase().includes(q);
      if (!matchName && !matchInvoice && !matchId) return false;
    }

    return true;
  });

  // Aggregates
  const totalNetDue = filteredRecords.reduce((acc, b) => acc + b.netDue, 0);
  const totalPaid = filteredRecords.reduce((acc, b) => acc + b.paidAmount, 0);
  const totalArrears = filteredRecords.reduce((acc, b) => acc + b.remainingBalance, 0);

  const handleSendNotice = (id: string) => {
    setNoticeSentId(id);
    setTimeout(() => setNoticeSentId(null), 2500);
  };

  const exportCSV = () => {
    const headers = [
      'Invoice Number',
      'Student ID',
      'Student Name',
      'Billing Tier',
      'Tuition Assessment',
      'Fees',
      'Financial Aid Deduction',
      'Net Due',
      'Paid Amount',
      'Remaining Balance',
      'Status',
      'Due Date',
      'Last Payment Date',
    ];

    const rows = filteredRecords.map((b) => {
      const student = students.find((s) => s.id === b.studentId);
      return [
        b.invoiceNumber,
        b.studentId,
        student ? student.name : '',
        `"${b.tier}"`,
        b.tuitionAssessment,
        b.fees,
        b.financialAidDeduction,
        b.netDue,
        b.paidAmount,
        b.remainingBalance,
        b.status,
        b.dueDate,
        b.lastPaymentDate || '',
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bursar_Tuition_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Top Ledger Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Total Assessed Net Tuition
          </div>
          <div className="text-2xl font-bold font-mono text-[#0f172a] tabular-nums">
            ${totalNetDue.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Across {filteredRecords.length} accounts
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Remitted & Settled
          </div>
          <div className="text-2xl font-bold font-mono text-[#059669] tabular-nums">
            ${totalPaid.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {((totalPaid / (totalNetDue || 1)) * 100).toFixed(1)}% collection performance
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Outstanding Arrears & Receivables
          </div>
          <div className="text-2xl font-bold font-mono text-[#be123c] tabular-nums">
            ${totalArrears.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {filteredRecords.filter((b) => b.status === 'Overdue').length} past census date
          </div>
        </div>
      </div>

      {/* Filter and Action Strip */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Payment Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Payment Status"
              className="bg-[#f8fafc] border border-[#cbd5e1] rounded px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
            >
              <option value="all">All Statuses ({billingRecords.length})</option>
              <option value="Paid">Cleared / Paid in Full</option>
              <option value="Pending">Pending Installment</option>
              <option value="Overdue">Delinquent / Overdue (Alert)</option>
            </select>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Tuition Tier:
            </span>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              aria-label="Tuition Tier"
              className="bg-[#f8fafc] border border-[#cbd5e1] rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
            >
              <option value="all">All Tuition Tiers</option>
              <option value="Tier 1">Tier 1 - Resident Undergrad</option>
              <option value="Tier 2">Tier 2 - Non-Resident</option>
              <option value="Tier 3">Tier 3 - Graduate Fellowship</option>
              <option value="Tier 4">Tier 4 - Executive MBA</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Search Invoice:
            </span>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search invoice #, student name, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0 pt-2 md:pt-0">
          <button
            onClick={onOpenPaymentModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Remittance</span>
          </button>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-white border border-[#cbd5e1] text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Ledger CSV</span>
          </button>
        </div>
      </div>

      {/* High-Density Bursar Ledger Data Table */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-[#64748b] border-b border-[#cbd5e1] uppercase text-[10px] tracking-wider font-semibold select-none h-8">
              <tr>
                <th className="py-2 px-4">Invoice #</th>
                <th className="py-2 px-4">Student & Program</th>
                <th className="py-2 px-3">Tuition Tier</th>
                <th className="py-2 px-3 text-right">Assessment</th>
                <th className="py-2 px-3 text-right">Fees</th>
                <th className="py-2 px-3 text-right">Scholarship / Aid</th>
                <th className="py-2 px-3 text-right">Net Billed</th>
                <th className="py-2 px-3 text-right">Paid</th>
                <th className="py-2 px-3 text-right">Balance Due</th>
                <th className="py-2 px-3 text-center">Status</th>
                <th className="py-2 px-3">Due Date</th>
                <th className="py-2 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-500">
                    No billing ledger records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const student = students.find((s) => s.id === record.studentId);
                  const isOverdue = record.status === 'Overdue';

                  return (
                    <tr
                      key={record.id}
                      className={`h-11 transition-colors ${
                        isOverdue ? 'bg-[#fff1f2]/20 hover:bg-[#fff1f2]/40' : 'hover:bg-[#f8fafc]'
                      }`}
                    >
                      {/* Invoice ID */}
                      <td className="py-2 px-4 font-mono font-medium text-slate-800">
                        {record.invoiceNumber}
                      </td>

                      {/* Student */}
                      <td className="py-2 px-4">
                        <button
                          onClick={() => student && onSelectStudent(student)}
                          className="text-left group"
                        >
                          <div className="font-semibold text-slate-900 group-hover:text-[#2563eb] transition-colors">
                            {student?.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-normal">
                            {student?.program}
                          </div>
                        </button>
                      </td>

                      {/* Tier */}
                      <td className="py-2 px-3">
                        <span className="text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-medium">
                          {record.tier.split(' - ')[0]}
                        </span>
                      </td>

                      {/* Tuition Assessment */}
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-700">
                        ${record.tuitionAssessment.toLocaleString()}
                      </td>

                      {/* Fees */}
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-600">
                        ${record.fees.toLocaleString()}
                      </td>

                      {/* Financial Aid Deduction */}
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-[#047857]">
                        -${record.financialAidDeduction.toLocaleString()}
                      </td>

                      {/* Net Due */}
                      <td className="py-2 px-3 text-right font-mono font-semibold tabular-nums text-slate-900">
                        ${record.netDue.toLocaleString()}
                      </td>

                      {/* Paid Amount */}
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-[#047857]">
                        ${record.paidAmount.toLocaleString()}
                      </td>

                      {/* Remaining Balance */}
                      <td className="py-2 px-3 text-right font-mono font-bold tabular-nums">
                        <span
                          className={
                            record.remainingBalance > 0 ? 'text-[#be123c]' : 'text-slate-400'
                          }
                        >
                          ${record.remainingBalance.toLocaleString()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2 px-3 text-center">
                        <StatusBadge
                          label={record.status}
                          variant={
                            record.status === 'Paid'
                              ? 'paid'
                              : record.status === 'Overdue'
                              ? 'overdue'
                              : 'pending'
                          }
                          size="sm"
                        />
                      </td>

                      {/* Due Date */}
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                        {record.dueDate}
                      </td>

                      {/* Actions */}
                      <td className="py-2 px-4 text-right">
                        {record.remainingBalance > 0 ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSendNotice(record.id)}
                              className="px-2 py-1 rounded bg-white border border-[#cbd5e1] text-[11px] text-slate-700 hover:bg-slate-50 font-medium"
                            >
                              {noticeSentId === record.id ? 'Notice Sent!' : 'Remind'}
                            </button>
                            <button
                              onClick={onOpenPaymentModal}
                              className="px-2 py-1 rounded bg-[#2563eb] text-white text-[11px] font-semibold hover:bg-[#1d4ed8]"
                            >
                              Post
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-medium flex items-center justify-end gap-1">
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Cleared</span>
                          </span>
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
            Bursar Reconciliation Ledger · {filteredRecords.length} Active Invoices
          </span>
          <span className="font-mono text-[11px]">
            Fiscal Accounting Period: AY 2026/27 Census Q1
          </span>
        </div>
      </div>
    </div>
  );
};
