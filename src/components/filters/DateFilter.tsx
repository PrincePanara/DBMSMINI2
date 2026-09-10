import React, { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import type { ColumnMeta, FilterCondition } from '../../types/dataset';
import { DATE_OPERATORS } from '../../services/filterEngine';
import { Label, Select, TextInput } from '../ui/Field';
import { Button } from '../ui/Button';
import { formatCell, uid } from '../../utils/format';

interface DateFilterProps {
  columns: ColumnMeta[];
  onAdd: (condition: FilterCondition) => void;
}

const PRESETS = ['today', 'yesterday', 'this_week', 'this_month', 'this_year'];
const NO_VALUE = ['is_empty', 'is_not_empty', ...PRESETS];

export function DateFilter({ columns, onAdd }: DateFilterProps) {
  const [column, setColumn] = useState('');
  const [operator, setOperator] = useState('after');
  const [value, setValue] = useState('');
  const [value2, setValue2] = useState('');

  const meta = columns.find((item) => item.name === column);
  const needsValue = !NO_VALUE.includes(operator);
  const isBetween = operator === 'between';
  const disabled = !column || needsValue && (!value || isBetween && !value2);

  const submit = () => {
    if (disabled) return;
    onAdd({ id: uid('cond'), kind: 'date', column, operator, value, value2, values: [] });
    setValue('');
    setValue2('');
  };

  if (!columns.length) {
    return <p className="px-5 py-4 text-[13px] text-ink-500">This dataset has no date columns.</p>;
  }

  return (
    <form
      className="px-5 py-4"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}>
      
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto]">
        <div>
          <Label htmlFor="date-column">Column</Label>
          <Select
            id="date-column"
            value={column}
            placeholder="Select column"
            onChange={(event) => setColumn(event.target.value)}
            options={columns.map((item) => ({ value: item.name, label: item.name }))} />
          
        </div>
        <div>
          <Label htmlFor="date-operator">Condition</Label>
          <Select
            id="date-operator"
            value={operator}
            onChange={(event) => setOperator(event.target.value)}
            options={DATE_OPERATORS} />
          
        </div>
        <div className={isBetween ? 'grid grid-cols-2 gap-2' : ''}>
          <div>
            <Label htmlFor="date-value">{isBetween ? 'From' : 'Date'}</Label>
            <TextInput
              id="date-value"
              type="date"
              value={needsValue ? value : ''}
              disabled={!needsValue}
              onChange={(event) => setValue(event.target.value)} />
            
          </div>
          {isBetween ?
          <div>
              <Label htmlFor="date-value2">To</Label>
              <TextInput
              id="date-value2"
              type="date"
              value={value2}
              onChange={(event) => setValue2(event.target.value)} />
            
            </div> :
          null}
        </div>
        <div className="flex items-end">
          <Button type="submit" variant="primary" disabled={disabled} icon={<PlusIcon size={14} />}>
            Add
          </Button>
        </div>
      </div>
      {meta && meta.minDate && meta.maxDate ?
      <p className="mt-2.5 text-[12px] text-ink-500">
          {meta.name} spans {formatCell(meta.minDate, 'date')} → {formatCell(meta.maxDate, 'date')}
        </p> :
      null}
    </form>);

}