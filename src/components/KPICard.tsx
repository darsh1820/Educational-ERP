import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  delta?: {
    value: string;
    isPositive: boolean;
    neutral?: boolean;
  };
  timeframe: string;
  icon: LucideIcon;
  sublabel?: string;
  className?: string;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  delta,
  timeframe,
  icon: Icon,
  sublabel,
  className = '',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-[#e2e8f0] rounded-lg p-4 transition-all duration-200 hover:border-[#cbd5e1] hover:shadow-[0_4px_6px_-1px_rgba(15,23,42,0.06),0_2px_4px_-2px_rgba(15,23,42,0.04)] ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Top Row: label-md uppercase title + icon */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-semibold text-[#64748b] tracking-wider uppercase truncate">
          {title}
        </span>
        <div className="w-7 h-7 rounded flex items-center justify-center bg-[#f1f5f9] text-[#2563eb] shrink-0">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Middle: headline-lg numerical values with tabular numbers */}
      <div className="mb-2.5">
        <div className="text-2xl font-bold text-[#0f172a] tabular-nums tracking-tight font-display">
          {value}
        </div>
        {sublabel && (
          <div className="text-xs text-[#64748b] mt-0.5 truncate">{sublabel}</div>
        )}
      </div>

      {/* Footer: relative delta chip and timeframe indicator */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-[#f1f5f9]">
        {delta ? (
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold tabular-nums ${
              delta.neutral
                ? 'bg-slate-100 text-slate-700'
                : delta.isPositive
                ? 'bg-[#ecfdf5] text-[#047857]'
                : 'bg-[#fff1f2] text-[#be123c]'
            }`}
          >
            {delta.value}
          </span>
        ) : (
          <span className="text-[#64748b] text-[11px]">Nominal</span>
        )}
        <span className="text-[#64748b] text-[11px] truncate">{timeframe}</span>
      </div>
    </div>
  );
};
