import React, { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import type { ColumnMeta, FilterCondition } from '../../types/dataset';
import { TEXT_OPERATORS } from '../../services/filterEngine';
import { Label, Select, TextInput } from '../ui/Field';
import { Button } from '../ui/Button';
import { uid } from '../../utils/format';

interface TextFilterProps {
  columns: ColumnMeta[];
  onAdd: (condition: FilterCondition) => void;
}

const NO_VALUE = ['is_empty', 'is_not_empty'];

export function TextFilter({ columns, onAdd }: TextFilterProps) {
  const [column, setColumn] = useState('');
  const [operator, setOperator] = useState('contains');
  const [value, setValue] = useState('');

  const needsValue = !NO_VALUE.includes(operator);
  const disabled = !column || needsValue && !value.trim();

  const submit = () => {
    if (disabled) return;
    onAdd({ id: uid('cond'), kind: 'text', column, operator, value: value.trim(), value2: '', values: [] });
    setValue('');
  };

  if (!columns.length) {
    return <p className="px-5 py-4 text-[13px] text-ink-500">This dataset has no text columns.</p>;
  }

  return (
    <form
      className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}>
      
      <div>
        <Label htmlFor="text-column">Column</Label>
        <Select
          id="text-column"
          value={column}
          placeholder="Select column"
          onChange={(event) => setColumn(event.target.value)}
          options={columns.map((item) => ({ value: item.name, label: item.name }))} />
        
      </div>
      <div>
        <Label htmlFor="text-operator">Condition</Label>
        <Select
          id="text-operator"
          value={operator}
          onChange={(event) => setOperator(event.target.value)}
          options={TEXT_OPERATORS} />
        
      </div>
      <div>
        <Label htmlFor="text-value">Value</Label>
        <TextInput
          id="text-value"
          value={needsValue ? value : ''}
          disabled={!needsValue}
          placeholder={needsValue ? 'Enter text…' : 'Not required'}
          onChange={(event) => setValue(event.target.value)} />
        
      </div>
      <div className="flex items-end">
        <Button type="submit" variant="primary" disabled={disabled} icon={<PlusIcon size={14} />}>
          Add
        </Button>
      </div>
    </form>);

}