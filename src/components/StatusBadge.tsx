import React from 'react';

export type StatusVariant =
  | 'paid'
  | 'present'
  | 'optimal'
  | 'compliant'
  | 'pending'
  | 'review'
  | 'tardy'
  | 'overdue'
  | 'absent'
  | 'probation'
  | 'academic'
  | 'examination'
  | 'deans-list';

interface StatusBadgeProps {
  label: string;
  variant: StatusVariant;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant,
  size = 'md',
  className = '',
}) => {
  let styleClasses = '';

  switch (variant) {
    case 'paid':
    case 'present':
    case 'optimal':
    case 'compliant':
    case 'deans-list':
      // Success token from spec: #ecfdf5 bg, #047857 text, 1px border #a7f3d0
      styleClasses = 'bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]';
      break;

    case 'pending':
    case 'review':
    case 'tardy':
      // Warning token from spec: #fffbeb bg, #b45309 text, 1px border #fde68a
      styleClasses = 'bg-[#fffbeb] text-[#b45309] border border-[#fde68a]';
      break;

    case 'overdue':
    case 'absent':
    case 'probation':
      // Critical / Danger token: #fff1f2 bg, #be123c text, 1px border #fecdd3
      styleClasses = 'bg-[#fff1f2] text-[#be123c] border border-[#fecdd3]';
      break;

    case 'academic':
    case 'examination':
    default:
      // Academic / Examination token: #f5f3ff bg, #6d28d9 text, 1px border #ddd6fe
      styleClasses = 'bg-[#f5f3ff] text-[#6d28d9] border border-[#ddd6fe]';
      break;
  }

  const sizeClasses =
    size === 'sm'
      ? 'h-[18px] px-2 text-[10px] tracking-wider'
      : 'h-[20px] px-2.5 text-[11px] tracking-wide';

  return (
    <span
      className={`inline-flex items-center justify-center font-semibold rounded-full uppercase leading-none whitespace-nowrap select-none ${sizeClasses} ${styleClasses} ${className}`}
    >
      {label}
    </span>
  );
};
