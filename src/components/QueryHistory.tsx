import React from 'react';
import { CopyIcon, HistoryIcon, PlayIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { useDataset } from '../contexts/DatasetContext';
import { formatDateTime, formatInt } from '../utils/format';
import { Button } from './ui/Button';
import { EmptyState } from './EmptyState';

interface QueryHistoryProps {
  onRun: (sql: string) => void;
}

export function QueryHistory({ onRun }: QueryHistoryProps) {
  const { history, deleteHistoryItem } = useDataset();

  if (!history.length) {
    return (
      <EmptyState
        icon={<HistoryIcon size={18} />}
        title="No queries yet"
        description="Queries you run are listed here so you can re-run or copy them." />);


  }

  const copy = async (sql: string) => {
    try {
      await navigator.clipboard.writeText(sql);
      toast.success('Query copied to clipboard');
    } catch {
      toast.error('Clipboard unavailable in this browser');
    }
  };

  return (
    <ul className="divide-y divide-ink-100">
      {history.map((item) =>
      <li key={item.id} className="px-5 py-3">
          <p className="break-all font-mono text-[12px] leading-5 text-ink-800">{item.sql}</p>
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-ink-500">
              {formatDateTime(item.at)} ·{' '}
              {item.ok ?
            <span className="text-brand-700">
                  {formatInt(item.rowCount)} rows · {Math.round(item.durationMs)} ms
                </span> :

            <span className="text-red-600">failed</span>
            }
            </p>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => onRun(item.sql)} icon={<PlayIcon size={13} />}>
                Run
              </Button>
              <Button size="sm" variant="ghost" onClick={() => copy(item.sql)} icon={<CopyIcon size={13} />}>
                Copy
              </Button>
              <Button
              size="sm"
              variant="ghost"
              onClick={() => deleteHistoryItem(item.id)}
              aria-label="Delete query from history"
              icon={<Trash2Icon size={13} />} />
            
            </div>
          </div>
        </li>
      )}
    </ul>);

}