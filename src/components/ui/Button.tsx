import React from 'react';
import { twMerge } from 'tailwind-merge';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary:
  'bg-brand-600 text-white border border-brand-600 hover:bg-brand-700 hover:border-brand-700 disabled:bg-brand-300 disabled:border-brand-300',
  secondary:
  'bg-white text-ink-700 border border-ink-200 hover:bg-ink-50 hover:text-ink-900 disabled:text-ink-400',
  ghost: 'bg-transparent text-ink-600 border border-transparent hover:bg-ink-100 hover:text-ink-900',
  danger: 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-2.5 text-[13px] gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-2'
};

export function Button({ variant = 'secondary', size = 'md', icon, className, children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={twMerge(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-70',
        VARIANTS[variant],
        SIZES[size],
        className
      )}>
      
      {icon}
      {children}
    </button>);

}