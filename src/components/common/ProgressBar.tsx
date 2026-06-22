import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value?: number;
  label?: string;
  showValue?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'rose' | 'purple';
  height?: 'sm' | 'md' | 'lg';
  segments?: {
    completed: number;
    inProgress: number;
    notStarted: number;
  };
}

const variantColors: Record<string, string> = {
  default: 'bg-brand-indigo-500',
  success: 'bg-semantic-success',
  warning: 'bg-semantic-warning',
  danger: 'bg-semantic-danger',
  rose: 'bg-gradient-to-r from-brand-rose-300 via-brand-rose-500 to-brand-rose-600',
  purple: 'bg-brand-purple-500',
};

const heightMap: Record<string, string> = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2.5',
};

export default function ProgressBar({
  value,
  label,
  showValue = false,
  variant = 'default',
  height = 'md',
  segments,
}: ProgressBarProps) {
  const clampedValue = value !== undefined ? Math.min(100, Math.max(0, value)) : 0;
  const h = heightMap[height];

  if (segments) {
    const { completed, inProgress, notStarted } = segments;
    const total = completed + inProgress + notStarted || 1;
    const completedPct = (completed / total) * 100;
    const inProgressPct = (inProgress / total) * 100;

    return (
      <div className="w-full">
        {(label || showValue) && (
          <div className="flex items-center justify-between mb-2">
            {label && <span className="text-body font-medium text-neutral-text-secondary">{label}</span>}
            {showValue && (
              <span className="text-body font-semibold tabular-nums text-neutral-text-primary">
                {clampedValue.toFixed(0)}%
              </span>
            )}
          </div>
        )}
        <div className={cn('w-full rounded-pill bg-neutral-border/50 overflow-hidden flex', h)}>
          <div
            className="h-full rounded-l-pill transition-all duration-500 ease-out relative"
            style={{
              width: `${completedPct}%`,
              background: 'linear-gradient(90deg, #6FCF97 0%, #57B680 100%)',
            }}
          >
            <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-l from-brand-rose-400/60 to-transparent" />
          </div>
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${inProgressPct}%`,
              background: 'linear-gradient(90deg, #416EB4 0%, #2E528F 100%)',
            }}
          />
          <div
            className="h-full rounded-r-pill bg-neutral-border/60 transition-all duration-500 ease-out"
            style={{ width: `${100 - completedPct - inProgressPct}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-body font-medium text-neutral-text-secondary">{label}</span>}
          {showValue && (
            <span className="text-body font-semibold tabular-nums text-neutral-text-primary">
              {clampedValue.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full rounded-pill bg-neutral-border/50 overflow-hidden', h)}>
        <div
          className={cn(
            'h-full rounded-pill transition-all duration-500 ease-out relative',
            variantColors[variant]
          )}
          style={{ width: `${clampedValue}%` }}
        >
          <div className="absolute right-0 top-0 h-full w-1.5 rounded-r-pill bg-gradient-to-l from-brand-rose-400/70 to-transparent" />
        </div>
      </div>
    </div>
  );
}
