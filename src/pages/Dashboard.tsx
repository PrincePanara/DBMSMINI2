import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { FilterIcon, InboxIcon, TableIcon, TerminalSquareIcon, UploadCloudIcon } from 'lucide-react';
import type { LayoutContext } from '../components/Layout';
import { Header } from '../components/Header';
import { Card, CardHeader } from '../components/ui/Card';
import { CsvUploader } from '../components/CsvUploader';
import { StatCard } from '../components/StatCard';
import { DataTable } from '../components/DataTable';
import { ColumnInfo } from '../components/ColumnInfo';
import { FilterChips } from '../components/FilterChips';
import { EmptyState } from '../components/EmptyState';
import { useDataset } from '../contexts/DatasetContext';
import { formatInt } from '../utils/format';

export function Dashboard() {
  const { onOpenNav } = useOutletContext<LayoutContext>();
  const { dataset, columns, filteredRows, settings, activeFilterCount, isFiltering } = useDataset();

  const counts = {
    number: columns.filter((column) => column.type === 'number').length,
    text: columns.filter((column) => column.type === 'text').length,
    date: columns.filter((column) => column.type === 'date').length,
    boolean: columns.filter((column) => column.type === 'boolean').length
  };

  return (
    <>
      <Header
        title="Dashboard"
        subtitle={dataset ? `${dataset.fileName} · analyzed in your browser` : 'Import a CSV to start exploring'}
        onOpenNav={onOpenNav} />
      

      <main className="mx-auto w-full max-w-[1400px] flex-1 space-y-4 px-4 py-5 lg:px-6">
        {!dataset ?
        <>
            <Card>
              <CardHeader
              title="Import a CSV file"
              description="Columns, data types and statistics are detected automatically."
              icon={<UploadCloudIcon size={16} />} />
            
              <CsvUploader />
            </Card>
            <Card>
              <EmptyState
              icon={<InboxIcon size={18} />}
              title="No dataset loaded"
              description="Upload a CSV file to start exploring your data." />
            
            </Card>
          </> :

        <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <StatCard label="Total Rows" value={formatInt(dataset.rowCount)} />
              <StatCard label="Total Columns" value={formatInt(dataset.columnCount)} />
              <StatCard
              label="Filtered Rows"
              value={isFiltering ? '…' : formatInt(filteredRows.length)}
              hint={activeFilterCount ? `${activeFilterCount} active filter${activeFilterCount > 1 ? 's' : ''}` : 'No filters'}
              accent />
            
              <StatCard label="Numeric Columns" value={formatInt(counts.number)} />
              <StatCard label="Text Columns" value={formatInt(counts.text)} />
              <StatCard
              label="Date Columns"
              value={formatInt(counts.date)}
              hint={counts.boolean ? `${counts.boolean} boolean` : undefined} />
            
            </div>

            <Card>
              <CardHeader
              title="Dataset"
              description={`${formatInt(dataset.rowCount)} rows × ${dataset.columnCount} columns`} />
            
              <CsvUploader compact />
              <div className="border-t border-ink-200 px-5 py-3.5">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-500">Active filters</p>
                <FilterChips />
              </div>
            </Card>

            <Card>
              <CardHeader
              title="Dataset preview"
              description="First rows of the current selection — search and filters apply here too."
              actions={
              <div className="flex gap-2">
                    <Link
                  to="/filters"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 text-[13px] font-medium text-ink-700 hover:bg-ink-50">
                  
                      <FilterIcon size={14} /> Filters
                    </Link>
                    <Link
                  to="/explorer"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 text-[13px] font-medium text-ink-700 hover:bg-ink-50">
                  
                      <TableIcon size={14} /> Data Explorer
                    </Link>
                    <Link
                  to="/sql"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-brand-600 bg-brand-600 px-2.5 text-[13px] font-medium text-white hover:bg-brand-700">
                  
                      <TerminalSquareIcon size={14} /> SQL Query
                    </Link>
                  </div>
              } />
            
              <DataTable
              columns={columns}
              rows={filteredRows}
              loading={isFiltering}
              pageSize={Math.min(settings.pageSize, 25)}
              density={settings.density}
              stickyHeader={settings.stickyHeader}
              label="Dataset preview"
              emptyIcon={<InboxIcon size={18} />}
              emptyTitle="No matching records"
              emptyDescription="Try changing or removing your filters." />
            
            </Card>

            <Card>
              <CardHeader
              title="Column information"
              description="Detected types, unique values, empty values and numeric ranges." />
            
              <ColumnInfo columns={columns} totalRows={dataset.rowCount} />
            </Card>
          </>
        }
      </main>
    </>);

}