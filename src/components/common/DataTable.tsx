import React, { useState, useMemo } from 'react';
import { Check, ChevronUp, ChevronDown, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column<T = any> {
  key: string;
  title: string;
  width?: string | number;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectChange?: (keys: string[]) => void;
  onRowClick?: (row: T, index: number) => void;
  rowKey?: string;
  emptyText?: string;
  loading?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  selectable = false,
  selectedKeys: controlledSelectedKeys,
  onSelectChange,
  onRowClick,
  rowKey = 'id',
  emptyText = '暂无数据',
  loading = false,
}: DataTableProps<T>) {
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const selectedKeys = controlledSelectedKeys ?? internalSelectedKeys;

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDirection === 'asc' ? av - bv : bv - av;
      }
      return sortDirection === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [data, sortKey, sortDirection]);

  const getRowKey = (row: T, index: number): string => {
    const key = row[rowKey];
    return key !== undefined ? String(key) : String(index);
  };

  const allSelected = sortedData.length > 0 && sortedData.every(
    (row, i) => selectedKeys.includes(getRowKey(row, i))
  );
  const someSelected = sortedData.some((row, i) => selectedKeys.includes(getRowKey(row, i)));

  const toggleAll = (_e: React.MouseEvent) => {
    const keys = sortedData.map((row, i) => getRowKey(row, i));
    const newKeys = allSelected
      ? selectedKeys.filter(k => !keys.includes(k))
      : Array.from(new Set([...selectedKeys, ...keys]));
    if (onSelectChange) onSelectChange(newKeys);
    else setInternalSelectedKeys(newKeys);
  };

  const toggleRow = (row: T, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const key = getRowKey(row, index);
    const newKeys = selectedKeys.includes(key)
      ? selectedKeys.filter(k => k !== key)
      : [...selectedKeys, key];
    if (onSelectChange) onSelectChange(newKeys);
    else setInternalSelectedKeys(newKeys);
  };

  const alignClass = (align?: string) => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  const Checkbox = ({ checked, indeterminate, onChange }: {
    checked: boolean;
    indeterminate?: boolean;
    onChange: (e: React.MouseEvent) => void;
  }) => (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        'w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all duration-150 flex-shrink-0',
        checked || indeterminate
          ? 'bg-gradient-rose-gold border-brand-rose-500'
          : 'bg-white border-neutral-border/80 hover:border-brand-rose-400'
      )}
    >
      {checked && <Check size={11} className="text-white" strokeWidth={3} />}
      {indeterminate && !checked && (
        <div className="w-2 h-0.5 bg-white rounded-full" />
      )}
    </button>
  );

  const SkeletonRow = () => (
    <tr>
      {selectable && (
        <td className="py-3.5 px-4">
          <div className="w-4 h-4 bg-neutral-border/40 rounded animate-pulse-soft" />
        </td>
      )}
      {columns.map((col) => (
        <td key={col.key} className="py-3.5 px-4">
          <div
            className="h-3 bg-neutral-border/40 rounded animate-pulse-soft"
            style={{ width: `${60 + Math.random() * 35}%` }}
          />
        </td>
      ))}
    </tr>
  );

  return (
    <div className="w-full overflow-hidden rounded-card border border-neutral-border bg-white shadow-card">
      <div className="overflow-auto max-h-full">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-brand-indigo-50/60 backdrop-blur-sm">
              {selectable && (
                <th className="w-12 py-3 px-4 border-b border-neutral-border/60">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected && !allSelected}
                    onChange={toggleAll}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={cn(
                    'py-3 px-4 border-b border-neutral-border/60 text-[12px] font-medium',
                    'text-neutral-text-primary whitespace-nowrap',
                    alignClass(col.align),
                    col.sortable && 'cursor-pointer select-none hover:bg-brand-indigo-100/40 transition-colors'
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className={cn(
                    'inline-flex items-center gap-1',
                    col.align === 'center' && 'justify-center w-full',
                    col.align === 'right' && 'justify-end w-full'
                  )}>
                    {col.title}
                    {col.sortable && (
                      <span className="flex flex-col -space-y-1 opacity-60">
                        <ChevronUp
                          size={12}
                          className={cn(
                            sortKey === col.key && sortDirection === 'asc'
                              ? 'text-brand-rose-500 opacity-100'
                              : ''
                          )}
                          strokeWidth={2.5}
                        />
                        <ChevronDown
                          size={12}
                          className={cn(
                            sortKey === col.key && sortDirection === 'desc'
                              ? 'text-brand-rose-500 opacity-100'
                              : ''
                          )}
                          strokeWidth={2.5}
                        />
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            ) : sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-16"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-neutral-bg flex items-center justify-center">
                      <Inbox size={28} className="text-neutral-text-tertiary" strokeWidth={1.5} />
                    </div>
                    <span className="text-body text-neutral-text-tertiary">{emptyText}</span>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => {
                const key = getRowKey(row, index);
                const isSelected = selectedKeys.includes(key);
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(row, index)}
                    className={cn(
                      'transition-colors duration-150',
                      onRowClick && 'cursor-pointer hover:bg-brand-indigo-50/30',
                      index % 2 === 1 && !isSelected && 'bg-neutral-bg/40',
                      isSelected && 'bg-brand-rose-50'
                    )}
                  >
                    {selectable && (
                      <td className={cn(
                        'py-3.5 px-4 border-b border-neutral-border/40 relative',
                        isSelected && 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-gradient-to-b before:from-brand-rose-300 before:via-brand-rose-500 before:to-brand-rose-600'
                      )}>
                        <Checkbox
                          checked={isSelected}
                          onChange={(e: any) => toggleRow(row, index, e)}
                        />
                      </td>
                    )}
                    {columns.map((col) => {
                      const cellValue = row[col.key];
                      return (
                        <td
                          key={col.key}
                          className={cn(
                            'py-3.5 px-4 border-b border-neutral-border/40 text-[12px] text-neutral-text-primary',
                            alignClass(col.align),
                            selectable === false && isSelected && 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-gradient-to-b before:from-brand-rose-300 before:via-brand-rose-500 before:to-brand-rose-600',
                            !selectable && isSelected && 'relative'
                          )}
                        >
                          {col.render ? col.render(row, index) : (cellValue ?? '-')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
