import React from 'react';
import { twMerge } from 'tailwind-merge';

const CONTROL =
'h-9 w-full rounded-lg border border-ink-200 bg-white px-2.5 text-[13px] text-ink-800 placeholder:text-ink-400 transition-colors duration-150 ease-out hover:border-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-ink-50 disabled:text-ink-400';

export function Label({ children, htmlFor }: {children: React.ReactNode;htmlFor?: string;}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-ink-500">
      {children}
    </label>);

}

export const TextInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function TextInput({ className, ...props }, ref) {
    return <input ref={ref} {...props} className={twMerge(CONTROL, className)} />;
  }
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: {value: string;label: string;}[];
  placeholder?: string;
}

export function Select({ options, placeholder, className, ...props }: SelectProps) {
  return (
    <select {...props} className={twMerge(CONTROL, 'appearance-none bg-[length:14px] pr-7', className)}
    style={{
      backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7476' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 8px center',
      backgroundSize: '14px'
    }}>
      
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) =>
      <option key={option.value} value={option.value}>
          {option.label}
        </option>
      )}
    </select>);

}

export function TypePill({ type }: {type: string;}) {
  const styles: Record<string, string> = {
    Number: 'bg-brand-50 text-brand-700 border-brand-200',
    Text: 'bg-ink-50 text-ink-600 border-ink-200',
    Date: 'bg-amber-50 text-amber-700 border-amber-200',
    Boolean: 'bg-sky-50 text-sky-700 border-sky-200'
  };
  return (
    <span
      className={twMerge(
        'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        styles[type] ?? styles.Text
      )}>
      
      {type}
    </span>);

}