import React from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface WarningCardProps {
  type: 'danger' | 'warning';
  category: string;
  title: string;
  description: string;
  relatedRoute?: string;
  onClick?: () => void;
}

export default function WarningCard({
  type,
  category,
  title,
  description,
  relatedRoute,
  onClick,
}: WarningCardProps) {
  const navigate = useNavigate();
  const isDanger = type === 'danger';

  const handleAction = () => {
    if (onClick) {
      onClick();
    } else if (relatedRoute) {
      navigate(relatedRoute);
    }
  };

  return (
    <div
      className={cn(
        'relative rounded-card p-4 flex gap-3 items-start',
        isDanger
          ? 'bg-semantic-dangerLight border-2 border-semantic-danger/30 animate-breath'
          : 'bg-semantic-warningLight border border-semantic-warning/40'
      )}
    >
      <div className={cn(
        'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
        isDanger ? 'bg-white/80' : 'bg-white/80'
      )}>
        {isDanger ? (
          <AlertCircle size={22} className="text-semantic-danger" strokeWidth={2.2} />
        ) : (
          <AlertTriangle size={22} className="text-semantic-warning" strokeWidth={2.2} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="mb-1.5">
          <span className={cn(
            'inline-block px-2 py-0.5 rounded text-caption font-semibold',
            isDanger
              ? 'bg-semantic-danger/15 text-semantic-danger'
              : 'bg-semantic-warning/15 text-semantic-warning'
          )}>
            {category}
          </span>
        </div>
        <h4 className="text-card-title font-semibold text-neutral-text-primary mb-1">{title}</h4>
        <p className="text-body text-neutral-text-secondary leading-relaxed line-clamp-2">{description}</p>

        <div className="mt-3">
          <button
            onClick={handleAction}
            className={cn(
              'text-caption font-semibold inline-flex items-center gap-1 transition-all duration-200 hover:gap-2',
              isDanger
                ? 'text-semantic-danger hover:text-semantic-danger/80'
                : 'text-semantic-warning hover:text-semantic-warning/80'
            )}
          >
            立即处理
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
