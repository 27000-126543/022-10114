import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: number | string;
  unit?: string;
  format?: 'percent' | 'number' | 'score' | 'currency';
  momChange?: number;
  variant?: 'success' | 'warning' | 'danger' | 'info';
  icon?: React.ElementType;
  delay?: number;
}

const variantIconColor: Record<string, string> = {
  success: 'text-semantic-success',
  warning: 'text-semantic-warning',
  danger: 'text-semantic-danger',
  info: 'text-semantic-info',
};

const variantGradient: Record<string, string> = {
  success: 'bg-gradient-kpi-success',
  warning: 'bg-gradient-kpi-warning',
  danger: 'bg-gradient-kpi-danger',
  info: 'bg-gradient-kpi-info',
};

export default function KPICard({
  title,
  value,
  unit,
  format,
  momChange,
  variant = 'info',
  icon: Icon,
  delay = 0,
}: KPICardProps) {
  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val;
    switch (format) {
      case 'percent':
        return val.toFixed(1);
      case 'currency':
        return val.toLocaleString('zh-CN');
      case 'score':
        return val.toFixed(1);
      case 'number':
      default:
        return val.toLocaleString('zh-CN');
    }
  };

  const isPositive = (momChange ?? 0) >= 0;
  const changeColor = variant === 'danger'
    ? (isPositive ? 'text-semantic-danger' : 'text-semantic-success')
    : (isPositive ? 'text-semantic-success' : 'text-semantic-danger');

  const displayUnit = unit ?? (format === 'percent' ? '%' : format === 'score' ? '分' : '');
  const valueSize = typeof value === 'number' && value >= 10000 ? 'text-kpi-sm' : 'text-kpi';

  return (
    <div
      className={cn(
        'relative rounded-card p-5 shadow-card border border-neutral-border',
        'card-hover card-rose-accent animate-fade-in-up overflow-hidden',
        variantGradient[variant]
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={cn(
              'w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-inner-soft',
              variantIconColor[variant]
            )}>
              <Icon size={20} strokeWidth={2} />
            </div>
          )}
        </div>
        <span className="text-caption text-neutral-text-secondary font-medium">{title}</span>
      </div>

      <div className="mb-3">
        <div className="flex items-baseline gap-1">
          <span className={cn(
            'font-bold tabular-nums text-neutral-text-primary tracking-tight',
            valueSize
          )}>
            {formatValue(value)}
          </span>
          {displayUnit && (
            <span className="text-body text-neutral-text-secondary font-medium ml-0.5">
              {displayUnit}
            </span>
          )}
        </div>
      </div>

      {momChange !== undefined && (
        <div className="flex items-center justify-end gap-1">
          {isPositive ? (
            <TrendingUp size={14} className={changeColor} strokeWidth={2.5} />
          ) : (
            <TrendingDown size={14} className={changeColor} strokeWidth={2.5} />
          )}
          <span className={cn('text-caption font-medium tabular-nums', changeColor)}>
            环比 {Math.abs(momChange).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}
