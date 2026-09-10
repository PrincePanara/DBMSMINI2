import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  DatabaseIcon,
  DownloadIcon,
  FilterIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  TableIcon,
  TerminalSquareIcon,
  BookmarkIcon,
  XIcon } from
'lucide-react';
import { useDataset } from '../contexts/DatasetContext';
import { formatInt } from '../utils/format';

const NAV_ITEMS = [
{ to: '/', label: 'Dashboard', icon: LayoutDashboardIcon },
{ to: '/explorer', label: 'Data Explorer', icon: TableIcon },
{ to: '/filters', label: 'Filters', icon: FilterIcon },
{ to: '/sql', label: 'SQL Query', icon: TerminalSquareIcon },
{ to: '/saved', label: 'Saved Queries', icon: BookmarkIcon },
{ to: '/export', label: 'Export', icon: DownloadIcon },
{ to: '/settings', label: 'Settings', icon: SettingsIcon }];


interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { dataset, activeFilterCount, savedQueries } = useDataset();

  const badges: Record<string, string> = {
    '/filters': activeFilterCount > 0 ? String(activeFilterCount) : '',
    '/saved': savedQueries.length > 0 ? String(savedQueries.length) : ''
  };

  return (
    <>
      {open ?
      <div
        className="fixed inset-0 z-30 bg-ink-900/30 lg:hidden"
        onClick={onClose}
        aria-hidden="true" /> :

      null}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-ink-200 bg-white transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'}`
        }
        aria-label="Main navigation">
        
        <div className="flex h-14 items-center justify-between border-b border-ink-200 px-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <DatabaseIcon size={16} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[13px] font-semibold leading-4 text-ink-900">Querybase</p>
              <p className="text-[11px] leading-4 text-ink-500">CSV analytics workspace</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-ink-500 hover:bg-ink-100 lg:hidden"
            aria-label="Close navigation">
            
            <XIcon size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 py-3">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) =>
            <li key={item.to}>
                <NavLink
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                `flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors duration-150 ease-out ${
                isActive ?
                'bg-brand-50 text-brand-700' :
                'text-ink-600 hover:bg-ink-50 hover:text-ink-900'}`

                }>
                
                  {({ isActive }) =>
                <>
                      <span className="flex items-center gap-2.5">
                        <item.icon size={16} aria-hidden="true" className={isActive ? 'text-brand-600' : 'text-ink-400'} />
                        {item.label}
                      </span>
                      {badges[item.to] ?
                  <span className="rounded-md bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700">
                          {badges[item.to]}
                        </span> :
                  null}
                    </>
                }
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        <div className="border-t border-ink-200 p-3">
          {dataset ?
          <div className="rounded-lg border border-ink-200 bg-ink-50/60 px-3 py-2.5">
              <p className="truncate text-[12px] font-medium text-ink-800" title={dataset.fileName}>
                {dataset.fileName}
              </p>
              <p className="mt-0.5 text-[11px] text-ink-500">
                {formatInt(dataset.rowCount)} rows · {dataset.columnCount} columns
              </p>
            </div> :

          <div className="rounded-lg border border-dashed border-ink-200 px-3 py-2.5">
              <p className="text-[12px] font-medium text-ink-700">No dataset loaded</p>
              <p className="mt-0.5 text-[11px] text-ink-500">Upload a CSV to begin.</p>
            </div>
          }
        </div>
      </aside>
    </>);

}