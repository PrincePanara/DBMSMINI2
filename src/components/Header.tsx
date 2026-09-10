import React from 'react';
import { MenuIcon, SearchIcon, XIcon } from 'lucide-react';
import { useDataset } from '../contexts/DatasetContext';
import { formatInt } from '../utils/format';

interface HeaderProps {
  title: string;
  subtitle: string;
  onOpenNav: () => void;
  actions?: React.ReactNode;
  showSearch?: boolean;
}

export function Header({ title, subtitle, onOpenNav, actions, showSearch = true }: HeaderProps) {
  const { dataset, search, setSearch, filteredRows, isFiltering } = useDataset();

  return (
    <header className="sticky top-0 z-20 border-b border-ink-200 bg-white/95 backdrop-blur">
      <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onOpenNav}
            className="mt-0.5 rounded-md border border-ink-200 p-1.5 text-ink-600 hover:bg-ink-50 lg:hidden"
            aria-label="Open navigation">
            
            <MenuIcon size={16} />
          </button>
          <div>
            <h1 className="text-[15px] font-semibold leading-5 text-ink-900">{title}</h1>
            <p className="mt-0.5 text-[12px] leading-4 text-ink-500">{subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {showSearch && dataset ?
          <div className="relative w-full sm:w-72">
              <SearchIcon
              size={15}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400"
              aria-hidden="true" />
            
              <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search across all columns..."
              aria-label="Search across all columns"
              className="h-9 w-full rounded-lg border border-ink-200 bg-white pl-8 pr-8 text-[13px] text-ink-800 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" />
            
              {search ?
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
              aria-label="Clear search">
              
                  <XIcon size={14} />
                </button> :
            null}
            </div> :
          null}
          {actions}
        </div>
      </div>

      {showSearch && dataset && search.trim() ?
      <div className="border-t border-ink-100 bg-brand-50/50 px-4 py-1.5 text-[12px] text-brand-800 lg:px-6" aria-live="polite">
          {isFiltering ? 'Searching…' : `${formatInt(filteredRows.length)} matching rows for “${search.trim()}”`}
        </div> :
      null}
    </header>);

}