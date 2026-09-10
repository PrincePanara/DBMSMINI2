import React from 'react';
import { BookmarkPlusIcon, EraserIcon, Loader2Icon, PlayIcon, WandSparklesIcon } from 'lucide-react';
import type { ColumnMeta } from '../types/dataset';
import { TABLE_NAME } from '../services/sqlEngine';
import { typeLabel } from '../utils/format';
import { Button } from './ui/Button';

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onFormat: () => void;
  onClear: () => void;
  onSave: () => void;
  running: boolean;
  columns: ColumnMeta[];
  disabled?: boolean;
}

export function SqlEditor({
  value,
  onChange,
  onRun,
  onFormat,
  onClear,
  onSave,
  running,
  columns,
  disabled = false
}: SqlEditorProps) {
  const insertColumn = (name: string) => {
    const safe = /^[A-Za-z_][A-Za-z0-9_]*$/.test(name) ? name : `[${name}]`;
    onChange(value ? `${value.replace(/;\s*$/, '')} ${safe}` : safe);
  };

  return (
    <div className="p-5">
      <div className="overflow-hidden rounded-card border border-ink-200">
        <div className="flex items-center justify-between border-b border-ink-200 bg-ink-50/70 px-3 py-1.5">
          <p className="font-mono text-[11px] text-ink-500">
            read-only SQL · table <span className="text-brand-700">{TABLE_NAME}</span>
          </p>
          <p className="text-[11px] text-ink-500">⌘ / Ctrl + Enter to run</p>
        </div>
        <label htmlFor="sql-input" className="sr-only">
          SQL query
        </label>
        <textarea
          id="sql-input"
          value={value}
          spellCheck={false}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
              event.preventDefault();
              onRun();
            }
          }}
          rows={7}
          placeholder={`SELECT * FROM ${TABLE_NAME} LIMIT 100;`}
          className="thin-scroll block w-full resize-y bg-white px-3.5 py-3 font-mono text-[13px] leading-6 text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-0 disabled:bg-ink-50" />
        
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={onRun} disabled={disabled || running}
        icon={running ? <Loader2Icon size={15} className="animate-spin" /> : <PlayIcon size={14} />}>
          
          {running ? 'Running…' : 'Run query'}
        </Button>
        <Button onClick={onFormat} disabled={disabled || !value.trim()} icon={<WandSparklesIcon size={14} />}>
          Format SQL
        </Button>
        <Button onClick={onSave} disabled={disabled || !value.trim()} icon={<BookmarkPlusIcon size={14} />}>
          Save query
        </Button>
        <Button variant="ghost" onClick={onClear} disabled={disabled || !value} icon={<EraserIcon size={14} />}>
          Clear
        </Button>
      </div>

      {columns.length ?
      <div className="mt-4 rounded-card border border-ink-200 bg-ink-50/40 px-3.5 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
            Schema · {TABLE_NAME} ({columns.length} columns)
          </p>
          <div className="thin-scroll mt-2 flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
            {columns.map((column) =>
          <button
            key={column.name}
            type="button"
            onClick={() => insertColumn(column.name)}
            title={`Insert ${column.name} (${typeLabel(column.type)})`}
            className="inline-flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-2 py-0.5 font-mono text-[11px] text-ink-700 transition-colors duration-150 ease-out hover:border-brand-300 hover:text-brand-700">
            
                {column.name}
                <span className="text-[10px] uppercase text-ink-400">{typeLabel(column.type).slice(0, 3)}</span>
              </button>
          )}
          </div>
          <p className="mt-2 text-[11px] text-ink-500">
            Column names containing spaces must be wrapped in square brackets, e.g. <span className="font-mono">[Order Date]</span>.
          </p>
        </div> :
      null}
    </div>);

}