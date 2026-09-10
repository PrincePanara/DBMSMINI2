import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <section className={twMerge('rounded-card border border-ink-200 bg-white shadow-card', className)}>
      {children}
    </section>);

}

interface CardHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, description, actions, icon, className }: CardHeaderProps) {
  return (
    <header
      className={twMerge(
        'flex flex-wrap items-start justify-between gap-3 border-b border-ink-200 px-5 py-4',
        className
      )}>
      
      <div className="flex items-start gap-2.5">
        {icon ? <span className="mt-0.5 text-brand-600">{icon}</span> : null}
        <div>
          <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
          {description ? <p className="mt-0.5 text-[13px] leading-5 text-ink-500">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>);

}