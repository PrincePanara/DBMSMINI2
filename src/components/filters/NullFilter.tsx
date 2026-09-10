import React, { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import type { ColumnMeta, FilterCondition } from '../../types/dataset';
import { NULL_OPERATORS } from '../../services/filterEngine';
import { Label, Select } from '../ui/Field';
import { Button } from '../ui/Button';
import { formatInt, uid } from '../../utils/format';

interface NullFilterProps {
  columns: ColumnMeta[];
  onAdd: (condition: FilterCondition) => void;
}

export function NullFilter({ columns, onAdd }: NullFilterProps) {
  const [column, setColumn] = useState('');
  const [operator, setOperator] = useState('is_empty');

  const meta = columns.find((item) => item.name === column);

  return (
    <form
      className="px-5 py-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!column) return;
        onAdd({ id: uid('cond'), kind: 'null', column, operator, value: '', value2: '', values: [] });
      }}>
      
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <div>
          <Label htmlFor="null-column">Column</Label>
          <Select
            id="null-column"
            value={column}
            placeholder="Select column"
            onChange={(event) => setColumn(event.target.value)}
            options={columns.map((item) => ({
              value: item.name,
              label: `${item.name}${item.emptyCount ? ` · ${formatInt(item.emptyCount)} empty` : ''}`
            }))} />
          
        </div>
        <div>
          <Label htmlFor="null-operator">Condition</Label>
          <Select
            id="null-operator"
            value={operator}
            onChange={(event) => setOperator(event.target.value)}
            options={NULL_OPERATORS} />
          
        </div>
        <div className="flex items-end">
          <Button type="submit" variant="primary" disabled={!column} icon={<PlusIcon size={14} />}>
            Add
          </Button>
        </div>
      </div>
      {meta ?
      <p className="mt-2.5 text-[12px] text-ink-500">
          {meta.name} has {formatInt(meta.emptyCount)} blank, null or missing value
          {meta.emptyCount === 1 ? '' : 's'}.
        </p> :
      null}
    </form>);

}