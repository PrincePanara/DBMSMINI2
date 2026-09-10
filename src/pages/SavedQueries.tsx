import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { BookmarkIcon, CopyIcon, PencilIcon, PlayIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import type { LayoutContext } from '../components/Layout';
import { Header } from '../components/Header';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TextInput } from '../components/ui/Field';
import { EmptyState } from '../components/EmptyState';
import { useDataset } from '../contexts/DatasetContext';
import { TABLE_NAME } from '../services/sqlEngine';
import { formatDateTime } from '../utils/format';

interface DraftQuery {
  id: string | null;
  name: string;
  description: string;
  sql: string;
}

const BLANK: DraftQuery = { id: null, name: '', description: '', sql: `SELECT * FROM ${TABLE_NAME} LIMIT 100;` };

export function SavedQueries() {
  const { onOpenNav } = useOutletContext<LayoutContext>();
  const navigate = useNavigate();
  const { dataset, savedQueries, saveQuery, updateSavedQuery, deleteSavedQuery, duplicateSavedQuery } = useDataset();
  const [draft, setDraft] = useState<DraftQuery | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft || !draft.name.trim() || !draft.sql.trim()) return;
    if (draft.id) {
      updateSavedQuery(draft.id, {
        name: draft.name.trim(),
        description: draft.description.trim(),
        sql: draft.sql.trim()
      });
      toast.success('Query updated');
    } else {
      saveQuery({ name: draft.name.trim(), description: draft.description.trim(), sql: draft.sql.trim() });
      toast.success('Query saved');
    }
    setDraft(null);
  };

  return (
    <>
      <Header
        title="Saved Queries"
        subtitle={`${savedQueries.length} saved quer${savedQueries.length === 1 ? 'y' : 'ies'}`}
        onOpenNav={onOpenNav}
        showSearch={false}
        actions={
        <Button variant="primary" onClick={() => setDraft(BLANK)} icon={<PlusIcon size={14} />}>
            New query
          </Button>
        } />
      

      <main className="mx-auto w-full max-w-[1100px] flex-1 space-y-4 px-4 py-5 lg:px-6">
        {draft ?
        <Card>
            <CardHeader title={draft.id ? 'Edit saved query' : 'New saved query'} />
            <form className="space-y-3 px-5 py-4" onSubmit={submit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="saved-name" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                    Query name
                  </label>
                  <TextInput
                  id="saved-name"
                  autoFocus
                  value={draft.name}
                  placeholder="High value customers"
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
                
                </div>
                <div>
                  <label htmlFor="saved-description" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                    Description
                  </label>
                  <TextInput
                  id="saved-description"
                  value={draft.description}
                  placeholder="Rows above the 10k threshold"
                  onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
                
                </div>
              </div>
              <div>
                <label htmlFor="saved-sql" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                  SQL query
                </label>
                <textarea
                id="saved-sql"
                rows={4}
                spellCheck={false}
                value={draft.sql}
                onChange={(event) => setDraft({ ...draft, sql: event.target.value })}
                className="thin-scroll block w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 font-mono text-[13px] leading-6 text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" />
              
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" variant="primary" disabled={!draft.name.trim() || !draft.sql.trim()}>
                  {draft.id ? 'Save changes' : 'Save query'}
                </Button>
                <Button variant="ghost" onClick={() => setDraft(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card> :
        null}

        <Card>
          <CardHeader title="Library" description="Saved queries persist in this browser." icon={<BookmarkIcon size={16} />} />
          {savedQueries.length === 0 ?
          <EmptyState
            icon={<BookmarkIcon size={18} />}
            title="No saved queries"
            description="Save a query from the SQL workspace, or create one here to reuse it later."
            action={
            <Button variant="primary" onClick={() => setDraft(BLANK)} icon={<PlusIcon size={14} />}>
                  New query
                </Button>
            } /> :


          <ul className="divide-y divide-ink-100">
              {savedQueries.map((query) =>
            <li key={query.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-ink-900">{query.name}</p>
                      {query.description ?
                  <p className="mt-0.5 text-[12px] leading-5 text-ink-500">{query.description}</p> :
                  null}
                      <p className="mt-1 text-[11px] text-ink-400">Saved {formatDateTime(query.createdAt)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Button
                    size="sm"
                    variant="primary"
                    disabled={!dataset}
                    title={dataset ? undefined : 'Upload a dataset first'}
                    onClick={() => navigate('/sql', { state: { sql: query.sql } })}
                    icon={<PlayIcon size={13} />}>
                    
                        Run
                      </Button>
                      <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                    setDraft({
                      id: query.id,
                      name: query.name,
                      description: query.description,
                      sql: query.sql
                    })
                    }
                    icon={<PencilIcon size={13} />}>
                    
                        Edit
                      </Button>
                      <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      duplicateSavedQuery(query.id);
                      toast.success('Query duplicated');
                    }}
                    icon={<CopyIcon size={13} />}>
                    
                        Duplicate
                      </Button>
                      <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      deleteSavedQuery(query.id);
                      toast.success('Query deleted');
                    }}
                    aria-label={`Delete ${query.name}`}
                    icon={<Trash2Icon size={13} />} />
                  
                    </div>
                  </div>
                  <pre className="thin-scroll mt-2.5 overflow-x-auto rounded-lg border border-ink-200 bg-ink-50/60 px-3 py-2 font-mono text-[12px] leading-5 text-ink-700">
                    {query.sql}
                  </pre>
                </li>
            )}
            </ul>
          }
        </Card>
      </main>
    </>);

}