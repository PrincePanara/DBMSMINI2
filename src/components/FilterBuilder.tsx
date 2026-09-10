import React from 'react';
import { LayersIcon, PlusIcon, Trash2Icon, XIcon } from 'lucide-react';
import type { FilterGroup } from '../types/dataset';
import { createEmptyGroup, useDataset } from '../contexts/DatasetContext';
import { describeCondition, isConditionComplete } from '../services/filterEngine';
import { Button } from './ui/Button';

interface FilterBuilderProps {
  activeGroupId: string;
  onActiveGroupChange: (id: string) => void;
}

function Combinator({
  value,
  onChange,
  label




}: {value: 'AND' | 'OR';onChange: (next: 'AND' | 'OR') => void;label: string;}) {
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-ink-200" role="group" aria-label={label}>
      {(['AND', 'OR'] as const).map((option) =>
      <button
        key={option}
        type="button"
        onClick={() => onChange(option)}
        aria-pressed={value === option}
        className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors duration-150 ease-out ${
        value === option ? 'bg-brand-600 text-white' : 'bg-white text-ink-500 hover:bg-ink-50'}`
        }>
        
          {option}
        </button>
      )}
    </div>);

}

export function FilterBuilder({ activeGroupId, onActiveGroupChange }: FilterBuilderProps) {
  const { draftGroups, setDraftGroups, groupCombinator, setGroupCombinator } = useDataset();

  const updateGroup = (id: string, patch: Partial<FilterGroup>) => {
    setDraftGroups((groups) => groups.map((group) => group.id === id ? { ...group, ...patch } : group));
  };

  const addGroup = () => {
    const group = createEmptyGroup();
    setDraftGroups((groups) => [...groups, group]);
    onActiveGroupChange(group.id);
  };

  const removeGroup = (id: string) => {
    setDraftGroups((groups) => {
      const next = groups.filter((group) => group.id !== id);
      const result = next.length ? next : [createEmptyGroup()];
      if (id === activeGroupId) onActiveGroupChange(result[0].id);
      return result;
    });
  };

  const removeCondition = (groupId: string, conditionId: string) => {
    setDraftGroups((groups) =>
    groups.map((group) =>
    group.id === groupId ?
    { ...group, conditions: group.conditions.filter((condition) => condition.id !== conditionId) } :
    group
    )
    );
  };

  return (
    <div className="p-5">
      {draftGroups.length > 1 ?
      <div className="mb-3 flex items-center gap-2">
          <span className="text-[12px] text-ink-500">Combine groups with</span>
          <Combinator value={groupCombinator} onChange={setGroupCombinator} label="Combine groups with" />
        </div> :
      null}

      <ol className="space-y-3">
        {draftGroups.map((group, index) => {
          const isActive = group.id === activeGroupId;
          return (
            <li key={group.id}>
              {index > 0 ?
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-brand-700">
                  {groupCombinator}
                </p> :
              null}
              <div
                className={`rounded-card border px-3.5 py-3 ${
                isActive ? 'border-brand-300 bg-brand-50/40' : 'border-ink-200 bg-white'}`
                }>
                
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <LayersIcon size={14} className="text-ink-400" aria-hidden="true" />
                    <p className="text-[13px] font-semibold text-ink-900">Group {index + 1}</p>
                    {group.conditions.length > 1 ?
                    <Combinator
                      value={group.combinator}
                      onChange={(next) => updateGroup(group.id, { combinator: next })}
                      label={`Combine conditions in group ${index + 1}`} /> :

                    null}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isActive ?
                    <span className="rounded-md bg-brand-100 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                        Receiving new conditions
                      </span> :

                    <Button size="sm" variant="ghost" onClick={() => onActiveGroupChange(group.id)}>
                        Add here
                      </Button>
                    }
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeGroup(group.id)}
                      aria-label={`Delete group ${index + 1}`}
                      icon={<Trash2Icon size={14} />} />
                    
                  </div>
                </div>

                {group.conditions.length === 0 ?
                <p className="mt-2 text-[12px] text-ink-500">
                    Empty group — add a condition from one of the filter sections above.
                  </p> :

                <ul className="mt-2.5 space-y-1.5">
                    {group.conditions.map((condition, conditionIndex) =>
                  <li key={condition.id} className="flex items-center gap-2">
                        <span className="w-9 flex-shrink-0 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                          {conditionIndex === 0 ? 'Where' : group.combinator}
                        </span>
                        <span className="flex flex-1 items-center justify-between gap-2 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5">
                          <span className="truncate text-[13px] text-ink-800">{describeCondition(condition)}</span>
                          <span className="flex items-center gap-1.5">
                            {!isConditionComplete(condition) ?
                        <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-700">
                                Incomplete
                              </span> :
                        null}
                            <button
                          type="button"
                          onClick={() => removeCondition(group.id, condition.id)}
                          className="rounded p-0.5 text-ink-400 transition-colors duration-150 ease-out hover:bg-ink-100 hover:text-ink-700"
                          aria-label={`Remove ${describeCondition(condition)}`}>
                          
                              <XIcon size={13} />
                            </button>
                          </span>
                        </span>
                      </li>
                  )}
                  </ul>
                }
              </div>
            </li>);

        })}
      </ol>

      <Button className="mt-3" size="sm" onClick={addGroup} icon={<PlusIcon size={14} />}>
        Add condition group
      </Button>
    </div>);

}