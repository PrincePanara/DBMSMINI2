import React, { useEffect, useRef, useState } from 'react';
import { ChevronDownIcon, DownloadIcon } from 'lucide-react';
import { Button } from './ui/Button';

export interface ExportOption {
  label: string;
  description: string;
  disabled?: boolean;
  onSelect: () => void;
}

interface ExportMenuProps {
  options: ExportOption[];
  size?: 'sm' | 'md';
  variant?: 'primary' | 'secondary';
}

export function ExportMenu({ options, size = 'sm', variant = 'secondary' }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (container.current && !container.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={container}>
      <Button
        size={size}
        variant={variant}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        icon={<DownloadIcon size={14} />}>
        
        Export
        <ChevronDownIcon size={13} />
      </Button>
      {open ?
      <div role="menu" className="absolute right-0 z-30 mt-1.5 w-72 rounded-lg border border-ink-200 bg-white p-1.5 shadow-pop">
          {options.map((option) =>
        <button
          key={option.label}
          type="button"
          role="menuitem"
          disabled={option.disabled}
          onClick={() => {
            option.onSelect();
            setOpen(false);
          }}
          className="block w-full rounded-md px-2.5 py-2 text-left transition-colors duration-150 ease-out hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent">
          
              <span className="block text-[13px] font-medium text-ink-900">{option.label}</span>
              <span className="mt-0.5 block text-[12px] leading-4 text-ink-500">{option.description}</span>
            </button>
        )}
        </div> :
      null}
    </div>);

}