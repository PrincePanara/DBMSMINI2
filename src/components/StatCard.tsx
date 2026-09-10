import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}

export function StatCard({ label, value, hint, accent = false }: StatCardProps) {
  return (
    <div
      className={
      accent ?
      'rounded-card border border-brand-200 bg-brand-50 px-4 py-3.5' :
      'rounded-card border border-ink-200 bg-white px-4 py-3.5 shadow-card'
      }>
      
      <p className={accent ? 'text-[11px] font-semibold uppercase tracking-wide text-brand-700' : 'text-[11px] font-semibold uppercase tracking-wide text-ink-500'}>
        {label}
      </p>
      <p className={accent ? 'mt-1.5 text-2xl font-semibold tabular-nums text-brand-800' : 'mt-1.5 text-2xl font-semibold tabular-nums text-ink-900'}>
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-[12px] text-ink-500">{hint}</p> : null}
    </div>);

}