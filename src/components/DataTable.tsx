import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ColumnsIcon,
  Loader2Icon } from
'lucide-react';
import { toast } from 'sonner';
import type { ColumnMeta, ColumnType, DataRow, SortState } from '../types/dataset';
import { formatCell, formatInt, typeLabel } from '../utils/format';
import { sortRows } from '../services/filterEngine';
import { Button } from './ui/Button';
import { EmptyState } from './EmptyState';

interface DataTableProps {
  columns: ColumnMeta[];
  rows: DataRow[];
  loading?: boolean;
  pageSize?: number;
  density?: 'comfortable' | 'compact';
  stickyHeader?: boolean;
  toolbar?: React.ReactNode;
  emptyIcon: React.ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  emptyTone?: 'neutral' | 'success';
  enableColumnVisibility?: boolean;
  label: string;
}

const MIN_WIDTH = 110;

export function DataTable({
  columns,
  rows,
  loading = false,
  pageSize = 50,
  density = 'comfortable',
  stickyHeader = true,
  toolbar,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyTone = 'neutral',
  enableColumnVisibility = false,
  label
}: DataTableProps) {
  const [sort, setSort] = useState<SortState | null>(null);
  const [page, setPage] = useState(1);
  const [widths, setWidths] = useState<Record<string, number>>({});
  const [hidden, setHidden] = useState<string[]>([]);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const resizing = useRef<{column: string;startX: number;startWidth: number;} | null>(null);

  useEffect(() => setPage(1), [rows, pageSize]);
  useEffect(() => {
    setSort(null);
    setHidden([]);
  }, [columns]);

  const visibleColumns = useMemo(
    () => columns.filter((column) => !hidden.includes(column.name)),
    [columns, hidden]
  );

  const sorted = useMemo(() => sortRows(rows, sort, columns), [rows, sort, columns]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageRows = useMemo(() => sorted.slice(start, start + pageSize), [sorted, start, pageSize]);

  const onSort = (column: string) => {
    setSort((current) => {
      if (!current || current.column !== column) return { column, direction: 'asc' };
      if (current.direction === 'asc') return { column, direction: 'desc' };
      return null;
    });
  };

  const handleMouseDown = (column: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const target = (event.currentTarget as HTMLElement).parentElement;
    resizing.current = {
      column,
      startX: event.clientX,
      startWidth: widths[column] ?? target?.getBoundingClientRect().width ?? 160
    };
  };

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!resizing.current) return;
    const { column, startX, startWidth } = resizing.current;
    const next = Math.max(MIN_WIDTH, startWidth + (event.clientX - startX));
    setWidths((current) => ({ ...current, [column]: next }));
  }, []);

  const handleMouseUp = useCallback(() => {
    resizing.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const copyCell = async (value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Cell copied to clipboard');
    } catch {
      toast.error('Clipboard unavailable in this browser');
    }
  };

  const cellPadding = density === 'compact' ? 'px-3 py-1.5' : 'px-3 py-2.5';
  const alignFor = (type: ColumnType) => type === 'number' ? 'text-right tabular-nums' : 'text-left';

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-200 px-4 py-2.5">
        <div className="flex items-center gap-2 text-[12px] text-ink-500">
          {loading ?
          <span className="flex items-center gap-1.5 text-ink-600">
              <Loader2Icon size={13} className="animate-spin" aria-hidden="true" /> Loading rows…
            </span> :
          sorted.length === 0 ?
          <span>No rows</span> :

          <span>
              Showing {formatInt(start + 1)}–{formatInt(Math.min(start + pageSize, sorted.length))} of{' '}
              {formatInt(sorted.length)} rows
            </span>
          }
          {sort ?
          <span className="rounded-md border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-[11px] text-ink-600">
              sorted by {sort.column} {sort.direction === 'asc' ? '↑' : '↓'}
            </span> :
          null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {toolbar}
          {enableColumnVisibility ?
          <div className="relative">
              <Button
              size="sm"
              icon={<ColumnsIcon size={14} />}
              onClick={() => setColumnsOpen((open) => !open)}
              aria-expanded={columnsOpen}>
              
                Columns{hidden.length ? ` (${columns.length - hidden.length}/${columns.length})` : ''}
              </Button>
              {columnsOpen ?
            <div className="absolute right-0 z-20 mt-1.5 w-60 rounded-lg border border-ink-200 bg-white p-2 shadow-pop">
                  <div className="mb-1.5 flex items-center justify-between px-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">Visible columns</span>
                    <button
                  type="button"
                  className="text-[11px] font-medium text-brand-700 hover:underline"
                  onClick={() => setHidden([])}>
                  
                      Show all
                    </button>
                  </div>
                  <div className="thin-scroll max-h-56 overflow-y-auto">
                    {columns.map((column) =>
                <label
                  key={column.name}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-[13px] text-ink-700 hover:bg-ink-50">
                  
                        <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-ink-300 text-brand-600 focus:ring-brand-200"
                    checked={!hidden.includes(column.name)}
                    onChange={(event) =>
                    setHidden((current) =>
                    event.target.checked ?
                    current.filter((name) => name !== column.name) :
                    [...current, column.name]
                    )
                    } />
                  
                        <span className="truncate">{column.name}</span>
                      </label>
                )}
                  </div>
                </div> :
            null}
            </div> :
          null}
        </div>
      </div>

      {loading ?
      <div className="space-y-2 p-4" aria-busy="true">
          {Array.from({ length: 6 }).map((_, index) =>
        <div key={index} className="h-8 animate-pulse rounded-md bg-ink-100" />
        )}
        </div> :
      sorted.length === 0 ?
      <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} tone={emptyTone} /> :

      <>
          <div className="thin-scroll max-h-[62vh] overflow-auto">
            <table className="w-full border-collapse text-[13px]" aria-label={label}>
              <thead className={stickyHeader ? 'sticky top-0 z-10' : ''}>
                <tr>
                  {visibleColumns.map((column) => {
                  const isSorted = sort?.column === column.name;
                  return (
                    <th
                      key={column.name}
                      scope="col"
                      aria-sort={isSorted ? sort?.direction === 'asc' ? 'ascending' : 'descending' : 'none'}
                      style={widths[column.name] ? { width: widths[column.name], minWidth: widths[column.name] } : { minWidth: MIN_WIDTH }}
                      className="relative select-none border-b border-ink-200 bg-ink-50/90 p-0 text-left font-semibold text-ink-700 backdrop-blur">
                      
                        <button
                        type="button"
                        onClick={() => onSort(column.name)}
                        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:text-brand-700"
                        title={`${column.name} · ${typeLabel(column.type)} — click to sort`}>
                        
                          <span className="truncate">{column.name}</span>
                          <span className="flex-shrink-0 text-ink-400">
                            {isSorted ?
                          sort?.direction === 'asc' ?
                          <ArrowUpIcon size={13} className="text-brand-600" /> :

                          <ArrowDownIcon size={13} className="text-brand-600" /> :


                          <span className="text-[10px] font-normal uppercase tracking-wide">
                                {typeLabel(column.type).slice(0, 3)}
                              </span>
                          }
                          </span>
                        </button>
                        <span
                        role="presentation"
                        onMouseDown={(event) => handleMouseDown(column.name, event)}
                        className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-brand-200" />
                      
                      </th>);

                })}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, rowIndex) =>
              <tr key={start + rowIndex} className="even:bg-ink-50/40 hover:bg-brand-50/40">
                    {visibleColumns.map((column) => {
                  const raw = row[column.name];
                  const text = formatCell(raw as never, column.type);
                  return (
                    <td
                      key={column.name}
                      onDoubleClick={() => copyCell(text)}
                      title={text ? `${text} — double-click to copy` : 'Empty'}
                      className={`border-b border-ink-100 text-ink-700 ${cellPadding} ${alignFor(column.type)}`}>
                      
                          {text === '' ? <span className="text-ink-300">—</span> : <span className="block truncate">{text}</span>}
                        </td>);

                })}
                  </tr>
              )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink-200 px-4 py-2.5">
            <p className="text-[12px] text-ink-500">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <Button
              size="sm"
              onClick={() => setPage(1)}
              disabled={currentPage === 1}>
              
                First
              </Button>
              <Button
              size="sm"
              icon={<ChevronLeftIcon size={14} />}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page">
              
                Prev
              </Button>
              <Button
              size="sm"
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page">
              
                Next
                <ChevronRightIcon size={14} />
              </Button>
              <Button size="sm" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages}>
                Last
              </Button>
            </div>
          </div>
        </>
      }
    </div>);

}