import React from 'react';
import { twMerge } from 'tailwind-merge';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
  tone?: 'neutral' | 'success';
}

export function EmptyState({ icon, title, description, action, className, tone = 'neutral' }: EmptyStateProps) {
  return (
    <div className={twMerge('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <span
        className={twMerge(
          'mb-3 flex h-11 w-11 items-center justify-center rounded-full border',
          tone === 'success' ? 'border-brand-200 bg-brand-50 text-brand-600' : 'border-ink-200 bg-ink-50 text-ink-400'
        )}>
        
        {icon}
      </span>
      <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
      <p className="mt-1 max-w-sm text-[13px] leading-5 text-ink-500">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>);

}