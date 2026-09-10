import React, { useMemo, useState } from 'react';
import { PlusIcon, SearchIcon } from 'lucide-react';
import type { ColumnMeta, FilterCondition } from '../../types/dataset';
import { Label, Select } from '../ui/Field';
import { Button } from '../ui/Button';
import { uid } from '../../utils/format';

interface ValueFilterProps {
  columns: ColumnMeta[];
  onAdd: (condition: FilterCondition) => void;
}

export function ValueFilter({ columns, onAdd }: ValueFilterProps) {
  const [column, setColumn] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState('');

  const meta = columns.find((item) => item.name === column);
  const values = useMemo(() => {
    const all = meta?.uniqueValues ?? [];
    const needle = query.trim().toLowerCase();
    return needle ? all.filter((value) => value.toLowerCase().includes(needle)) : all;
  }, [meta, query]);

  const submit = () => {
    if (!column || !selected.length) return;
    onAdd({ id: uid('cond'), kind: 'values', column, operator: 'in', value: '', value2: '', values: selected });
    setSelected([]);
    setQuery('');
  };

  if (!columns.length) {
    return (
      <p className="px-5 py-4 text-[13px] text-ink-500">
        No low-cardinality columns detected. Columns with up to 60 distinct values appear here.
      </p>);

  }

  return (
    <div className="px-5 py-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="value-column">Column</Label>
          <Select
            id="value-column"
            value={column}
            placeholder="Select column"
            onChange={(event) => {
              setColumn(event.target.value);
              setSelected([]);
              setQuery('');
            }}
            options={columns.map((item) => ({
              value: item.name,
              label: `${item.name} (${item.uniqueValues.length})`
            }))} />
          
        </div>
        {meta ?
        <div>
            <Label htmlFor="value-search">Search values</Label>
            <div className="relative">
              <SearchIcon size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden="true" />
              <input
              id="value-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter values…"
              className="h-9 w-full rounded-lg border border-ink-200 bg-white pl-8 pr-3 text-[13px] placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" />
            
            </div>
          </div> :
        null}
      </div>

      {meta ?
      <>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[12px] text-ink-500">
              {selected.length} of {meta.uniqueValues.length} selected
            </p>
            <div className="flex gap-1.5">
              <Button size="sm" variant="ghost" onClick={() => setSelected(values)}>
                Select all
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
                Clear all
              </Button>
            </div>
          </div>
          <div className="thin-scroll mt-1.5 max-h-48 overflow-y-auto rounded-lg border border-ink-200 p-1.5">
            {values.length === 0 ?
          <p className="px-2 py-3 text-[13px] text-ink-500">No values match “{query}”.</p> :

          values.map((value) =>
          <label
            key={value}
            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-ink-700 hover:bg-ink-50">
            
                  <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-ink-300 text-brand-600 focus:ring-brand-200"
              checked={selected.includes(value)}
              onChange={(event) =>
              setSelected((current) =>
              event.target.checked ? [...current, value] : current.filter((item) => item !== value)
              )
              } />
            
                  <span className="truncate">{value === '' ? '(empty)' : value}</span>
                </label>
          )
          }
          </div>
          <div className="mt-3">
            <Button variant="primary" onClick={submit} disabled={!selected.length} icon={<PlusIcon size={14} />}>
              Add
            </Button>
          </div>
        </> :
      null}
    </div>);

}