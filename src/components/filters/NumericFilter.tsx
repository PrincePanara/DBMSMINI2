import React, { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import type { ColumnMeta, FilterCondition } from '../../types/dataset';
import { NUMBER_OPERATORS } from '../../services/filterEngine';
import { Label, Select, TextInput } from '../ui/Field';
import { Button } from '../ui/Button';
import { formatNumber, uid } from '../../utils/format';

interface NumericFilterProps {
  columns: ColumnMeta[];
  onAdd: (condition: FilterCondition) => void;
}

const NO_VALUE = ['is_empty', 'is_not_empty'];

export function NumericFilter({ columns, onAdd }: NumericFilterProps) {
  const [column, setColumn] = useState('');
  const [operator, setOperator] = useState('gt');
  const [value, setValue] = useState('');
  const [value2, setValue2] = useState('');

  const meta = columns.find((item) => item.name === column);
  const needsValue = !NO_VALUE.includes(operator);
  const isBetween = operator === 'between';
  const disabled = !column || needsValue && (!value.trim() || isBetween && !value2.trim());

  const submit = () => {
    if (disabled) return;
    onAdd({ id: uid('cond'), kind: 'number', column, operator, value: value.trim(), value2: value2.trim(), values: [] });
    setValue('');
    setValue2('');
  };

  if (!columns.length) {
    return <p className="px-5 py-4 text-[13px] text-ink-500">This dataset has no numeric columns.</p>;
  }

  return (
    <form
      className="px-5 py-4"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}>
      
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
        <div>
          <Label htmlFor="num-column">Column</Label>
          <Select
            id="num-column"
            value={column}
            placeholder="Select column"
            onChange={(event) => setColumn(event.target.value)}
            options={columns.map((item) => ({ value: item.name, label: item.name }))} />
          
        </div>
        <div>
          <Label htmlFor="num-operator">Condition</Label>
          <Select
            id="num-operator"
            value={operator}
            onChange={(event) => setOperator(event.target.value)}
            options={NUMBER_OPERATORS} />
          
        </div>
        <div className={isBetween ? 'grid grid-cols-2 gap-2' : ''}>
          <div>
            <Label htmlFor="num-value">{isBetween ? 'From' : 'Value'}</Label>
            <TextInput
              id="num-value"
              type="number"
              value={needsValue ? value : ''}
              disabled={!needsValue}
              placeholder={needsValue ? '0' : 'Not required'}
              onChange={(event) => setValue(event.target.value)} />
            
          </div>
          {isBetween ?
          <div>
              <Label htmlFor="num-value2">To</Label>
              <TextInput
              id="num-value2"
              type="number"
              value={value2}
              onChange={(event) => setValue2(event.target.value)}
              placeholder="100" />
            
            </div> :
          null}
        </div>
        <div className="flex items-end">
          <Button type="submit" variant="primary" disabled={disabled} icon={<PlusIcon size={14} />}>
            Add
          </Button>
        </div>
      </div>
      {meta && meta.min !== null && meta.max !== null ?
      <p className="mt-2.5 text-[12px] text-ink-500">
          {meta.name} ranges from {formatNumber(meta.min)} to {formatNumber(meta.max)}
          {meta.average !== null ? ` · average ${formatNumber(meta.average)}` : ''}
        </p> :
      null}
    </form>);

}