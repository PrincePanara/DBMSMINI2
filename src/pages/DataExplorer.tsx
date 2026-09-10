import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { InboxIcon, UploadCloudIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { LayoutContext } from '../components/Layout';
import { Header } from '../components/Header';
import { Card, CardHeader } from '../components/ui/Card';
import { DataTable } from '../components/DataTable';
import { FilterChips } from '../components/FilterChips';
import { ExportMenu } from '../components/ExportMenu';
import { EmptyState } from '../components/EmptyState';
import { useDataset } from '../contexts/DatasetContext';
import { exportRows, timestampedName } from '../services/exportService';
import { formatInt } from '../utils/format';

export function DataExplorer() {
  const { onOpenNav } = useOutletContext<LayoutContext>();
  const { dataset, columns, filteredRows, settings, isFiltering, activeFilterCount } = useDataset();

  const columnNames = columns.map((column) => column.name);

  return (
    <>
      <Header
        title="Data Explorer"
        subtitle={
        dataset ?
        `${formatInt(filteredRows.length)} of ${formatInt(dataset.rowCount)} rows in view` :
        'No dataset loaded'
        }
        onOpenNav={onOpenNav}
        actions={
        dataset ?
        <ExportMenu
          options={[
          {
            label: 'Export current view',
            description: `${formatInt(filteredRows.length)} rows, all ${columns.length} columns`,
            disabled: !filteredRows.length,
            onSelect: () => {
              exportRows(timestampedName(dataset.fileName), columnNames, filteredRows);
              toast.success('CSV exported successfully');
            }
          },
          {
            label: 'Export full dataset',
            description: `${formatInt(dataset.rowCount)} rows, ignores filters and search`,
            onSelect: () => {
              exportRows(timestampedName(`${dataset.fileName}-full`), columnNames, dataset.rows);
              toast.success('CSV exported successfully');
            }
          }]
          } /> :

        null
        } />
      

      <main className="mx-auto w-full max-w-[1400px] flex-1 space-y-4 px-4 py-5 lg:px-6">
        {!dataset ?
        <Card>
            <EmptyState
            icon={<UploadCloudIcon size={18} />}
            title="No dataset loaded"
            description="Upload a CSV file to start exploring your data."
            action={
            <Link
              to="/"
              className="inline-flex h-9 items-center rounded-lg bg-brand-600 px-3.5 text-sm font-medium text-white hover:bg-brand-700">
              
                  Go to upload
                </Link>
            } />
          
          </Card> :

        <>
            {activeFilterCount ?
          <div className="flex flex-wrap items-center gap-2 rounded-card border border-ink-200 bg-white px-4 py-2.5 shadow-card">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">Active filters</span>
                <FilterChips showEmpty={false} />
              </div> :
          null}

            <Card>
              <CardHeader
              title={dataset.fileName}
              description="Click a header to sort, drag its right edge to resize, double-click a cell to copy." />
            
              <DataTable
              columns={columns}
              rows={filteredRows}
              loading={isFiltering}
              pageSize={settings.pageSize}
              density={settings.density}
              stickyHeader={settings.stickyHeader}
              enableColumnVisibility
              label="Dataset rows"
              emptyIcon={<InboxIcon size={18} />}
              emptyTitle="No matching records"
              emptyDescription="Try changing or removing your filters." />
            
            </Card>
          </>
        }
      </main>
    </>);

}