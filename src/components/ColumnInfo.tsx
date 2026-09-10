import React, { useMemo, useState } from 'react';
import { SearchIcon } from 'lucide-react';
import type { ColumnMeta } from '../types/dataset';
import { formatCell, formatInt, formatNumber, typeLabel } from '../utils/format';
import { TypePill } from './ui/Field';

interface ColumnInfoProps {
  columns: ColumnMeta[];
  totalRows: number;
}

export function ColumnInfo({ columns, totalRows }: ColumnInfoProps) {
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return columns;
    return columns.filter((column) => column.name.toLowerCase().includes(needle));
  }, [columns, query]);

  return (
    <div className="p-5">
      <div className="relative mb-4 max-w-xs">
        <SearchIcon size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find a column..."
          aria-label="Find a column"
          className="h-9 w-full rounded-lg border border-ink-200 bg-white pl-8 pr-3 text-[13px] placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" />
        
      </div>

      {visible.length === 0 ?
      <p className="py-6 text-center text-[13px] text-ink-500">No columns match “{query}”.</p> :

      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((column) => {
          const completeness = totalRows ? Math.round((totalRows - column.emptyCount) / totalRows * 100) : 0;
          return (
            <li key={column.name} className="rounded-card border border-ink-200 bg-white px-3.5 py-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-[13px] font-semibold text-ink-900" title={column.name}>
                    {column.name}
                  </p>
                  <TypePill type={typeLabel(column.type)} />
                </div>

                <dl className="mt-2.5 space-y-1 text-[12px]">
                  <Row label="Unique values" value={formatInt(column.uniqueCount)} />
                  <Row label="Empty values" value={formatInt(column.emptyCount)} />
                  {column.type === 'number' ?
                <>
                      <Row label="Minimum" value={column.min === null ? '—' : formatNumber(column.min)} />
                      <Row label="Maximum" value={column.max === null ? '—' : formatNumber(column.max)} />
                      <Row label="Average" value={column.average === null ? '—' : formatNumber(column.average)} />
                    </> :
                null}
                  {column.type === 'date' ?
                <>
                      <Row label="Earliest" value={column.minDate ? formatCell(column.minDate, 'date') : '—'} />
                      <Row label="Latest" value={column.maxDate ? formatCell(column.maxDate, 'date') : '—'} />
                    </> :
                null}
                </dl>

                <div className="mt-2.5">
                  <div className="h-1 w-full overflow-hidden rounded-full bg-ink-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${completeness}%` }} />
                  </div>
                  <p className="mt-1 text-[11px] text-ink-500">{completeness}% populated</p>
                </div>

                {column.isEnum && column.uniqueValues.length ?
              <p className="mt-2 truncate text-[11px] text-ink-500" title={column.uniqueValues.join(', ')}>
                    Values: {column.uniqueValues.slice(0, 4).join(', ')}
                    {column.uniqueValues.length > 4 ? ` +${column.uniqueValues.length - 4}` : ''}
                  </p> :
              null}
              </li>);

        })}
        </ul>
      }
    </div>);

}

function Row({ label, value }: {label: string;value: string;}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-ink-500">{label}</dt>
      <dd className="font-medium tabular-nums text-ink-800">{value}</dd>
    </div>);

}