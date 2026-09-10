import React from 'react';
import { XIcon } from 'lucide-react';
import { useDataset } from '../contexts/DatasetContext';
import { describeCondition } from '../services/filterEngine';

export function FilterChips({ showEmpty = true }: {showEmpty?: boolean;}) {
  const { appliedGroups, groupCombinator, removeAppliedCondition } = useDataset();

  if (!appliedGroups.length) {
    return showEmpty ? <p className="text-[13px] text-ink-500">No filters applied — showing the full dataset.</p> : null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {appliedGroups.map((group, groupIndex) =>
      <React.Fragment key={group.id}>
          {groupIndex > 0 ?
        <span className="px-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-700">
              {groupCombinator}
            </span> :
        null}
          <span className="flex flex-wrap items-center gap-1.5 rounded-lg border border-ink-200 bg-ink-50/60 px-1.5 py-1">
            {group.conditions.map((condition, index) =>
          <React.Fragment key={condition.id}>
                {index > 0 ?
            <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">
                    {group.combinator}
                  </span> :
            null}
                <span className="inline-flex items-center gap-1 rounded-md border border-brand-200 bg-white px-2 py-0.5 text-[12px] text-brand-800">
                  {describeCondition(condition)}
                  <button
                type="button"
                onClick={() => removeAppliedCondition(group.id, condition.id)}
                className="rounded p-0.5 text-brand-600 transition-colors duration-150 ease-out hover:bg-brand-100 hover:text-brand-800"
                aria-label={`Remove filter ${describeCondition(condition)}`}>
                
                    <XIcon size={12} />
                  </button>
                </span>
              </React.Fragment>
          )}
          </span>
        </React.Fragment>
      )}
    </div>);

}