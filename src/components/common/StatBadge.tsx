import React from 'react';
import { cn } from '@/lib/utils';

interface StatBadgeProps {
  label: string;
  value: number | string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'rose';
  size?: 'sm' | 'md';
}

const variantStyles: Record<string, string> = {
  default: 'bg-neutral-border/70 text-neutral-text-primary',
  success: 'bg-semantic-successLight text-semantic-success',
  warning: 'bg-semantic-warningLight text-semantic-warning',
  danger: 'bg-semantic-dangerLight text-semantic-danger',
  info: 'bg-semantic-infoLight text-semantic-info',
  rose: 'bg-brand-rose-50 text-brand-rose-700',
};

const sizeStyles: Record<string, string> = {
  sm: 'text-[10px] px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
};

export default function StatBadge({
  label,
  value,
  variant = 'default',
  size = 'md',
}: StatBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-pill font-bold whitespace-nowrap',
      variantStyles[variant],
      sizeStyles[size]
    )}>
      <span className="opacity-80">{label}</span>
      <span className="tabular-nums">{value}</span>
    </span>
  );
}
