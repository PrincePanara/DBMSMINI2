import React, { useMemo } from 'react';
import { AlertTriangleIcon, CheckCircle2Icon, DatabaseIcon, DownloadIcon, TerminalSquareIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { QueryResultData } from '../types/dataset';
import { inferResultColumns } from '../utils/resultColumns';
import { exportRows, timestampedName } from '../services/exportService';
import { formatInt } from '../utils/format';
import { Button } from './ui/Button';
import { Card, CardHeader } from './ui/Card';
import { DataTable } from './DataTable';
import { EmptyState } from './EmptyState';

interface QueryResultProps {
  result: QueryResultData | null;
  error: string | null;
  running: boolean;
  pageSize: number;
  density: 'comfortable' | 'compact';
}

export function QueryResult({ result, error, running, pageSize, density }: QueryResultProps) {
  const columns = useMemo(
    () => result ? inferResultColumns(result.columns, result.rows) : [],
    [result]
  );

  if (error) {
    return (
      <Card className="border-red-200">
        <div className="px-5 py-4" role="alert">
          <div className="flex items-start gap-2.5">
            <AlertTriangleIcon size={17} className="mt-0.5 flex-shrink-0 text-red-600" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-red-800">Query error</p>
              <p className="mt-1 font-mono text-[12px] leading-5 text-red-700">{error}</p>
              <p className="mt-2 text-[13px] text-ink-600">
                Check the column names against the schema and try again — your query is still in the editor.
              </p>
            </div>
          </div>
        </div>
      </Card>);

  }

  if (running) {
    return (
      <Card>
        <CardHeader title="Query results" description="Executing against the in-browser dataset…" />
        <div className="space-y-2 p-4" aria-busy="true">
          {Array.from({ length: 5 }).map((_, index) =>
          <div key={index} className="h-8 animate-pulse rounded-md bg-ink-100" />
          )}
        </div>
      </Card>);

  }

  if (!result) {
    return (
      <Card>
        <EmptyState
          icon={<TerminalSquareIcon size={18} />}
          title="No query run yet"
          description="Write a SELECT statement above and run it to see results here." />
        
      </Card>);

  }

  const exportResult = () => {
    exportRows(timestampedName('query-result'), result.columns, result.rows);
    toast.success('CSV exported successfully', { description: `${formatInt(result.rowCount)} rows written` });
  };

  return (
    <Card>
      <CardHeader
        title="Query results"
        description={result.sql.length > 90 ? `${result.sql.slice(0, 90)}…` : result.sql}
        actions={
        result.rowCount > 0 ?
        <Button size="sm" onClick={exportResult} icon={<DownloadIcon size={14} />}>
              Export query result
            </Button> :
        null
        } />
      
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-ink-200 bg-brand-50/50 px-5 py-2 text-[12px] text-brand-800" aria-live="polite">
        <span className="flex items-center gap-1.5 font-medium">
          <CheckCircle2Icon size={13} aria-hidden="true" /> Query executed successfully
        </span>
        <span>Rows returned: {formatInt(result.rowCount)}</span>
        <span>Execution time: {result.durationMs < 1 ? '<1' : Math.round(result.durationMs)} ms</span>
      </div>
      {result.rowCount === 0 ?
      <EmptyState
        icon={<DatabaseIcon size={18} />}
        title="Query completed successfully"
        description="No records matched your query."
        tone="success" /> :


      <DataTable
        columns={columns}
        rows={result.rows}
        pageSize={pageSize}
        density={density}
        enableColumnVisibility
        label="SQL query results"
        emptyIcon={<DatabaseIcon size={18} />}
        emptyTitle="Query completed successfully"
        emptyDescription="No records matched your query."
        emptyTone="success" />

      }
    </Card>);

}