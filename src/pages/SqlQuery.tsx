import React, { useEffect, useState } from 'react';
import { Link, useLocation, useOutletContext } from 'react-router-dom';
import { DatabaseIcon, FilterIcon, HistoryIcon, ShieldCheckIcon, TerminalSquareIcon, UploadCloudIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { LayoutContext } from '../components/Layout';
import { Header } from '../components/Header';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TextInput } from '../components/ui/Field';
import { SqlEditor } from '../components/SqlEditor';
import { QueryResult } from '../components/QueryResult';
import { QueryHistory } from '../components/QueryHistory';
import { EmptyState } from '../components/EmptyState';
import { useDataset } from '../contexts/DatasetContext';
import { TABLE_NAME, formatSql, runQuery } from '../services/sqlEngine';
import { formatInt } from '../utils/format';

interface LocationState {
  sql?: string;
  autorun?: boolean;
}

export function SqlQuery() {
  const { onOpenNav } = useOutletContext<LayoutContext>();
  const location = useLocation();
  const {
    dataset,
    columns,
    filteredRows,
    activeFilterCount,
    settings,
    pushHistory,
    saveQuery,
    lastResult,
    setLastResult
  } = useDataset();

  const [sql, setSql] = useState(`SELECT * FROM ${TABLE_NAME} LIMIT 100;`);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveForm, setSaveForm] = useState<{name: string;description: string;} | null>(null);

  const execute = async (statement: string) => {
    if (!dataset) return;
    setRunning(true);
    setError(null);
    try {
      const result = await runQuery(statement);
      setLastResult(result);
      pushHistory({ sql: result.sql, ok: true, rowCount: result.rowCount, durationMs: result.durationMs });
      toast.success('Query executed successfully', { description: `${formatInt(result.rowCount)} rows returned` });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'The query could not be executed.';
      setError(message);
      setLastResult(null);
      pushHistory({ sql: statement.trim(), ok: false, rowCount: 0, durationMs: 0 });
      toast.error('Invalid SQL query', { description: message });
    } finally {
      setRunning(false);
    }
  };

  const state = location.state as LocationState | null;
  useEffect(() => {
    if (state?.sql) {
      setSql(state.sql);
      window.history.replaceState({}, '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.sql]);

  if (!dataset) {
    return (
      <>
        <Header title="SQL Query" subtitle="No dataset loaded" onOpenNav={onOpenNav} showSearch={false} />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-5 lg:px-6">
          <Card>
            <EmptyState
              icon={<UploadCloudIcon size={18} />}
              title="No dataset loaded"
              description="Upload a CSV file to query it as the table “data”."
              action={
              <Link
                to="/"
                className="inline-flex h-9 items-center rounded-lg bg-brand-600 px-3.5 text-sm font-medium text-white hover:bg-brand-700">
                
                  Go to upload
                </Link>
              } />
            
          </Card>
        </main>
      </>);

  }

  const stringColumn = columns.find((c) => c.type === 'string')?.name;
  const numericColumn = columns.find((c) => c.type === 'number')?.name;
  const dateColumn = columns.find((c) => c.type === 'date')?.name || columns.find((c) => c.type === 'string' && c.name.toLowerCase().includes('date'))?.name;

  const examples = [
    `SELECT * FROM ${TABLE_NAME} LIMIT 100;`,
    columns[0] ? `SELECT ${safeName(columns[0].name)}, COUNT(*) AS total FROM ${TABLE_NAME} GROUP BY ${safeName(columns[0].name)} ORDER BY total DESC LIMIT 10;` : '',
    numericColumn ? `SELECT AVG(${safeName(numericColumn)}) AS avg_val, MIN(${safeName(numericColumn)}) AS min_val, MAX(${safeName(numericColumn)}) AS max_val FROM ${TABLE_NAME};` : '',
    stringColumn ? `SELECT * FROM ${TABLE_NAME} WHERE ${safeName(stringColumn)} IS NOT NULL LIMIT 50;` : '',
    dateColumn ? `SELECT * FROM ${TABLE_NAME} ORDER BY ${safeName(dateColumn)} DESC LIMIT 100;` : '',
    numericColumn && stringColumn ? `SELECT ${safeName(stringColumn)}, SUM(${safeName(numericColumn)}) AS total_sum FROM ${TABLE_NAME} GROUP BY ${safeName(stringColumn)} ORDER BY total_sum DESC LIMIT 10;` : ''
  ].filter(Boolean) as string[];

  return (
    <>
      <Header
        title="SQL Query"
        subtitle={`Query the uploaded dataset as “${TABLE_NAME}” — read-only, in your browser`}
        onOpenNav={onOpenNav}
        showSearch={false} />
      

      <main className="mx-auto w-full max-w-[1400px] flex-1 space-y-4 px-4 py-5 lg:px-6">
        <div className="grid gap-3 md:grid-cols-3">
          <MethodCard
            icon={<DatabaseIcon size={15} />}
            title="Dataset"
            value={`${formatInt(dataset.rowCount)} rows`}
            note="Full uploaded CSV — the source for both methods." />
          
          <MethodCard
            icon={<FilterIcon size={15} />}
            title="Visual filters"
            value={`${formatInt(filteredRows.length)} rows`}
            note={activeFilterCount ? `${activeFilterCount} active conditions` : 'No conditions applied'} />
          
          <MethodCard
            icon={<TerminalSquareIcon size={15} />}
            title="SQL query"
            value={lastResult ? `${formatInt(lastResult.rowCount)} rows` : 'Not run'}
            note="Runs against the full dataset, independent of visual filters."
            accent />
          
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <Card>
              <CardHeader
                title="SQL workspace"
                description="Only single read-only SELECT statements are allowed."
                icon={<TerminalSquareIcon size={16} />}
                actions={
                  <select
                    className="block w-64 rounded-md border border-ink-200 bg-white py-1.5 pl-3 pr-8 text-[13px] font-medium text-ink-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    onChange={(e) => {
                      if (e.target.value) {
                        setSql(e.target.value);
                      }
                    }}
                    value=""
                  >
                    <option value="" disabled>Load a ready-made query...</option>
                    {examples.map((example, i) => (
                      <option key={i} value={example}>
                        {example.length > 50 ? example.substring(0, 50) + '...' : example}
                      </option>
                    ))}
                  </select>
                }
              />
              
              <SqlEditor
                value={sql}
                onChange={setSql}
                running={running}
                columns={columns}
                onRun={() => execute(sql)}
                onFormat={() => {
                  setSql(formatSql(sql));
                  toast.success('Query formatted');
                }}
                onClear={() => {
                  setSql('');
                  setError(null);
                }}
                onSave={() => setSaveForm({ name: '', description: '' })} />
              

              {saveForm ?
              <form
                className="grid gap-3 border-t border-ink-200 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!saveForm.name.trim()) return;
                  saveQuery({ name: saveForm.name.trim(), description: saveForm.description.trim(), sql });
                  setSaveForm(null);
                  toast.success('Query saved');
                }}>
                
                  <div>
                    <label htmlFor="query-name" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                      Query name
                    </label>
                    <TextInput
                    id="query-name"
                    autoFocus
                    value={saveForm.name}
                    placeholder="High value customers"
                    onChange={(event) => setSaveForm({ ...saveForm, name: event.target.value })} />
                  
                  </div>
                  <div>
                    <label htmlFor="query-description" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                      Description
                    </label>
                    <TextInput
                    id="query-description"
                    value={saveForm.description}
                    placeholder="Optional note about what this returns"
                    onChange={(event) => setSaveForm({ ...saveForm, description: event.target.value })} />
                  
                  </div>
                  <div className="flex items-end gap-2">
                    <Button type="submit" variant="primary" disabled={!saveForm.name.trim()}>
                      Save
                    </Button>
                    <Button variant="ghost" onClick={() => setSaveForm(null)}>
                      Cancel
                    </Button>
                  </div>
                </form> :
              null}
            </Card>

            <QueryResult
              result={lastResult}
              error={error}
              running={running}
              pageSize={settings.pageSize}
              density={settings.density} />
            
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader title="Example queries" description="Generated from this dataset's own columns." />
              <ul className="divide-y divide-ink-100">
                {examples.map((example) =>
                <li key={example} className="px-5 py-2.5">
                    <button
                    type="button"
                    onClick={() => setSql(example)}
                    className="block w-full text-left font-mono text-[12px] leading-5 text-ink-700 transition-colors duration-150 ease-out hover:text-brand-700">
                    
                      {example}
                    </button>
                  </li>
                )}
              </ul>
            </Card>

            <Card>
              <CardHeader title="Recent queries" description="Last 25 executions" icon={<HistoryIcon size={16} />} />
              <QueryHistory
                onRun={(statement) => {
                  setSql(statement);
                  execute(statement);
                }} />
              
            </Card>

            <Card className="border-brand-200 bg-brand-50/50">
              <div className="flex items-start gap-2.5 px-5 py-4">
                <ShieldCheckIcon size={16} className="mt-0.5 flex-shrink-0 text-brand-600" aria-hidden="true" />
                <div>
                  <p className="text-[13px] font-semibold text-ink-900">Read-only &amp; local</p>
                  <p className="mt-1 text-[12px] leading-5 text-ink-600">
                    Queries execute in an in-memory engine inside this browser tab. Only the uploaded dataset is
                    reachable, statements that modify data are rejected, and nothing is uploaded anywhere.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>);

}

function safeName(name: string): string {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name) ? name : `[${name}]`;
}

function numericExample(column?: string): string {
  if (!column) return `SELECT COUNT(*) AS total_rows FROM ${TABLE_NAME};`;
  return `SELECT AVG(${safeName(column)}) AS average_value FROM ${TABLE_NAME};`;
}

function MethodCard({
  icon,
  title,
  value,
  note,
  accent = false






}: {icon: React.ReactNode;title: string;value: string;note: string;accent?: boolean;}) {
  return (
    <div
      className={`rounded-card border px-4 py-3 ${
      accent ? 'border-brand-200 bg-brand-50' : 'border-ink-200 bg-white shadow-card'}`
      }>
      
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
        <span className={accent ? 'text-brand-600' : 'text-ink-400'}>{icon}</span>
        {title}
      </p>
      <p className="mt-1.5 text-lg font-semibold tabular-nums text-ink-900">{value}</p>
      <p className="mt-0.5 text-[12px] leading-4 text-ink-500">{note}</p>
    </div>);

}