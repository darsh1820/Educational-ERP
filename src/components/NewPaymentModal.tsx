import React, { useState } from 'react';
import { X, DollarSign, CheckCircle2 } from 'lucide-react';
import { BillingRecord, Student } from '../types/academic';

interface NewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  billingRecords: BillingRecord[];
  students: Student[];
  onRecordPayment: (billingId: string, amount: number, method: string) => void;
}

export const NewPaymentModal: React.FC<NewPaymentModalProps> = ({
  isOpen,
  onClose,
  billingRecords,
  students,
  onRecordPayment,
}) => {
  const [selectedBillingId, setSelectedBillingId] = useState<string>(
    billingRecords.find((b) => b.remainingBalance > 0)?.id || billingRecords[0]?.id || ''
  );
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Electronic ACH Transfer');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const currentBilling = billingRecords.find((b) => b.id === selectedBillingId);
  const student = students.find((s) => s.id === currentBilling?.studentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0 || !selectedBillingId) return;

    onRecordPayment(selectedBillingId, amount, paymentMethod);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-[1px] flex items-center justify-center p-4">
      <div className="bg-white border border-[#cbd5e1] rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-5 py-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0f172a] font-display">
              Bursar Payment Settlement & Reconciliation
            </h3>
            <p className="text-xs text-[#64748b]">
              Post tuition receipt and update student balance
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 font-display">
              Payment Successfully Reconciled
            </h4>
            <p className="text-xs text-slate-600">
              Receipt generated and student tuition ledger adjusted. Electronic confirmation dispatched.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {/* Student / Invoice Selector */}
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                Select Student Account / Invoice
              </label>
              <select
                value={selectedBillingId}
                onChange={(e) => {
                  setSelectedBillingId(e.target.value);
                  const sel = billingRecords.find((b) => b.id === e.target.value);
                  if (sel) {
                    setPaymentAmount(sel.remainingBalance > 0 ? sel.remainingBalance.toString() : '');
                  }
                }}
                className="w-full bg-white border border-[#cbd5e1] rounded h-9 px-3 text-xs text-[#0f172a] focus:ring-2 focus:ring-[#2563eb] focus:outline-none"
              >
                {billingRecords.map((b) => {
                  const stu = students.find((s) => s.id === b.studentId);
                  return (
                    <option key={b.id} value={b.id}>
                      {b.invoiceNumber} - {stu?.name} ({stu?.id}) · Bal: ${b.remainingBalance.toLocaleString()} [{b.status}]
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Account Status Card */}
            {currentBilling && student && (
              <div className="p-3 bg-[#f8fafc] border border-slate-200 rounded grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Student Name:</span>
                  <div className="font-semibold text-slate-900">{student.name}</div>
                  <div className="text-[11px] text-slate-500">{student.program}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Remaining Balance:</span>
                  <div className="text-base font-bold font-mono text-[#be123c] tabular-nums">
                    ${currentBilling.remainingBalance.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">Total Billed: ${currentBilling.netDue.toLocaleString()}</div>
                </div>
              </div>
            )}

            {/* Payment Amount */}
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                Remittance Amount (USD $)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white border border-[#cbd5e1] rounded h-9 pl-9 pr-3 text-sm font-mono text-[#0f172a] focus:ring-2 focus:ring-[#2563eb] focus:outline-none"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                Settlement Tender / Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-white border border-[#cbd5e1] rounded h-9 px-3 text-xs text-[#0f172a] focus:ring-2 focus:ring-[#2563eb] focus:outline-none"
              >
                <option value="Electronic ACH Transfer">Electronic ACH Direct Deposit</option>
                <option value="Corporate Scholarship Wire">Corporate / Foundation Sponsorship Wire</option>
                <option value="Visa Debit / Credit Card">Card Payment (Visa / MC)</option>
                <option value="SWIFT International Wire">SWIFT International Wire</option>
                <option value="Federal Title IV Disbursement">Federal Title IV Aid Disbursement</option>
                <option value="Cashier's Check">Certified Cashier's Check</option>
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded text-xs font-semibold bg-white border border-[#cbd5e1] text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded text-xs font-semibold bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors"
              >
                Confirm Settlement
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
