import React, { useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  BookmarkIcon,
  CalendarIcon,
  CheckIcon,
  CircleSlashIcon,
  FilterIcon,
  HashIcon,
  InboxIcon,
  ListIcon,
  RotateCcwIcon,
  TypeIcon,
  UploadCloudIcon,
  Trash2Icon } from
'lucide-react';
import { toast } from 'sonner';
import type { FilterCondition } from '../types/dataset';
import type { LayoutContext } from '../components/Layout';
import { Header } from '../components/Header';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TextInput } from '../components/ui/Field';
import { TextFilter } from '../components/filters/TextFilter';
import { NumericFilter } from '../components/filters/NumericFilter';
import { DateFilter } from '../components/filters/DateFilter';
import { ValueFilter } from '../components/filters/ValueFilter';
import { NullFilter } from '../components/filters/NullFilter';
import { FilterBuilder } from '../components/FilterBuilder';
import { FilterChips } from '../components/FilterChips';
import { DataTable } from '../components/DataTable';
import { EmptyState } from '../components/EmptyState';
import { createEmptyGroup, useDataset } from '../contexts/DatasetContext';
import { formatDateTime, formatInt } from '../utils/format';

export function Filters() {
  const { onOpenNav } = useOutletContext<LayoutContext>();
  const {
    dataset,
    columns,
    draftGroups,
    setDraftGroups,
    applyDraftFilters,
    clearFilters,
    appliedGroups,
    hasPendingChanges,
    filteredRows,
    settings,
    isFiltering,
    savedFilterSets,
    saveFilterSet,
    applyFilterSet,
    deleteFilterSet
  } = useDataset();

  const [activeGroupId, setActiveGroupId] = useState(draftGroups[0]?.id ?? '');
  const [savingName, setSavingName] = useState<string | null>(null);

  const currentGroupId = draftGroups.some((group) => group.id === activeGroupId) ?
  activeGroupId :
  draftGroups[0]?.id ?? '';

  const textColumns = useMemo(() => columns.filter((column) => column.type === 'text'), [columns]);
  const numberColumns = useMemo(() => columns.filter((column) => column.type === 'number'), [columns]);
  const dateColumns = useMemo(() => columns.filter((column) => column.type === 'date'), [columns]);
  const enumColumns = useMemo(() => columns.filter((column) => column.isEnum), [columns]);

  const draftCount = draftGroups.reduce((total, group) => total + group.conditions.length, 0);

  const addCondition = (condition: FilterCondition) => {
    setDraftGroups((groups) =>
    groups.map((group) =>
    group.id === currentGroupId ? { ...group, conditions: [...group.conditions, condition] } : group
    )
    );
    toast.success('Condition added', { description: 'Choose “Apply filters” to update the dataset.' });
  };

  const onApply = () => {
    const count = applyDraftFilters();
    toast.success('Filters applied successfully', {
      description: count ? `${count} condition${count > 1 ? 's' : ''} active` : 'All conditions cleared'
    });
  };

  if (!dataset) {
    return (
      <>
        <Header title="Filters" subtitle="No dataset loaded" onOpenNav={onOpenNav} showSearch={false} />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-5 lg:px-6">
          <Card>
            <EmptyState
              icon={<UploadCloudIcon size={18} />}
              title="No dataset loaded"
              description="Upload a CSV file to start building filters."
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

  return (
    <>
      <Header
        title="Filters"
        subtitle="Build conditions per data type, then combine them with AND / OR"
        onOpenNav={onOpenNav} />
      

      <main className="mx-auto w-full max-w-[1400px] flex-1 space-y-4 px-4 py-5 lg:px-6">
        <div className="flex flex-wrap items-center gap-2 rounded-card border border-ink-200 bg-white px-4 py-2.5 shadow-card">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">Applied</span>
          <FilterChips />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader title="Text filters" description={`${textColumns.length} text columns`} icon={<TypeIcon size={16} />} />
            <TextFilter columns={textColumns} onAdd={addCondition} />
          </Card>
          <Card>
            <CardHeader title="Numeric filters" description={`${numberColumns.length} numeric columns`} icon={<HashIcon size={16} />} />
            <NumericFilter columns={numberColumns} onAdd={addCondition} />
          </Card>
          <Card>
            <CardHeader title="Date filters" description={`${dateColumns.length} date columns`} icon={<CalendarIcon size={16} />} />
            <DateFilter columns={dateColumns} onAdd={addCondition} />
          </Card>
          <Card>
            <CardHeader
              title="Value filters"
              description={`${enumColumns.length} columns with a limited set of values`}
              icon={<ListIcon size={16} />} />
            
            <ValueFilter columns={enumColumns} onAdd={addCondition} />
          </Card>
          <Card className="xl:col-span-2">
            <CardHeader
              title="Empty / null filters"
              description="Match blank, null and missing values in any column"
              icon={<CircleSlashIcon size={16} />} />
            
            <NullFilter columns={columns} onAdd={addCondition} />
          </Card>
        </div>

        <Card>
          <CardHeader
            title="Filter logic"
            description="Conditions inside a group combine with the group operator; groups combine with each other."
            icon={<FilterIcon size={16} />}
            actions={
            <span className="text-[12px] text-ink-500">
                {draftCount} condition{draftCount === 1 ? '' : 's'} in {draftGroups.length} group
                {draftGroups.length === 1 ? '' : 's'}
              </span>
            } />
          
          <FilterBuilder activeGroupId={currentGroupId} onActiveGroupChange={setActiveGroupId} />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-200 bg-ink-50/50 px-5 py-3.5">
            <div className="text-[13px] text-ink-600">
              <span className="tabular-nums">{formatInt(dataset.rowCount)}</span> total rows{' '}
              <span className="mx-1 text-ink-400">→</span>{' '}
              <span className="font-semibold tabular-nums text-brand-700">{formatInt(filteredRows.length)}</span>{' '}
              matching rows
              {hasPendingChanges ?
              <span className="ml-2 rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold uppercase text-amber-700">
                  Unapplied changes
                </span> :
              null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary" onClick={onApply} icon={<CheckIcon size={14} />}>
                Apply filters
              </Button>
              <Button onClick={() => setSavingName(savingName === null ? '' : null)} icon={<BookmarkIcon size={14} />}>
                Save filter
              </Button>
              <Button
                variant="ghost"
                onClick={() => setDraftGroups(appliedGroups.length ? appliedGroups : [createEmptyGroup()])}
                disabled={!hasPendingChanges}
                icon={<RotateCcwIcon size={14} />}>
                
                Reset
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  clearFilters();
                  toast.success('Filters cleared');
                }}
                disabled={!draftCount && !appliedGroups.length}>
                
                Clear filters
              </Button>
            </div>
          </div>

          {savingName !== null ?
          <form
            className="flex flex-wrap items-end gap-2 border-t border-ink-200 px-5 py-3.5"
            onSubmit={(event) => {
              event.preventDefault();
              if (!savingName.trim() || !draftCount) return;
              saveFilterSet(savingName.trim());
              setSavingName(null);
              toast.success('Filter set saved');
            }}>
            
              <div className="w-full sm:w-72">
                <label htmlFor="filter-set-name" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                  Filter set name
                </label>
                <TextInput
                id="filter-set-name"
                value={savingName}
                autoFocus
                placeholder="e.g. High value customers"
                onChange={(event) => setSavingName(event.target.value)} />
              
              </div>
              <Button type="submit" variant="primary" disabled={!savingName.trim() || !draftCount}>
                Save
              </Button>
              <Button variant="ghost" onClick={() => setSavingName(null)}>
                Cancel
              </Button>
            </form> :
          null}
        </Card>

        {savedFilterSets.length ?
        <Card>
            <CardHeader title="Saved filter sets" description="Re-apply a previously saved combination of conditions." />
            <ul className="divide-y divide-ink-100">
              {savedFilterSets.map((set) =>
            <li key={set.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                  <div>
                    <p className="text-[13px] font-medium text-ink-900">{set.name}</p>
                    <p className="mt-0.5 text-[11px] text-ink-500">
                      {set.groups.reduce((total, group) => total + group.conditions.length, 0)} conditions ·{' '}
                      {formatDateTime(set.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                  size="sm"
                  onClick={() => {
                    applyFilterSet(set.id);
                    toast.success('Filters applied successfully', { description: set.name });
                  }}>
                  
                      Apply
                    </Button>
                    <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteFilterSet(set.id)}
                  aria-label={`Delete ${set.name}`}
                  icon={<Trash2Icon size={13} />} />
                
                  </div>
                </li>
            )}
            </ul>
          </Card> :
        null}

        <Card>
          <CardHeader
            title="Filtered result"
            description={`${formatInt(filteredRows.length)} rows match the applied filters and search`} />
          
          <DataTable
            columns={columns}
            rows={filteredRows}
            loading={isFiltering}
            pageSize={Math.min(settings.pageSize, 25)}
            density={settings.density}
            stickyHeader={settings.stickyHeader}
            label="Filtered rows"
            emptyIcon={<InboxIcon size={18} />}
            emptyTitle="No matching records"
            emptyDescription="Try changing or removing your filters." />
          
        </Card>
      </main>
    </>);

}