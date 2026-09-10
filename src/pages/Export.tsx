import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { DownloadIcon, UploadCloudIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { LayoutContext } from '../components/Layout';
import { Header } from '../components/Header';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/EmptyState';
import { useDataset } from '../contexts/DatasetContext';
import { exportRows, timestampedName } from '../services/exportService';
import { formatInt } from '../utils/format';

export function Export() {
  const { onOpenNav } = useOutletContext<LayoutContext>();
  const { dataset, columns, filteredRows, lastResult, activeFilterCount, search } = useDataset();

  if (!dataset) {
    return (
      <>
        <Header title="Export" subtitle="No dataset loaded" onOpenNav={onOpenNav} showSearch={false} />
        <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-5 lg:px-6">
          <Card>
            <EmptyState
              icon={<UploadCloudIcon size={18} />}
              title="No dataset loaded"
              description="Upload a CSV file before exporting."
              action={
              <Link
                to="/"
                className="inline-flex h-9 items-center rounded-lg bg-brand-600 px-3.5 text-sm font-medium text-white hover:bg-brand-700">
                
                  Go to upload
                </Link>
              } />
            
          </Card>
        </main>
      </>);

  }

  const columnNames = columns.map((column) => column.name);

  const cards = [
  {
    title: 'Filtered data',
    description:
    activeFilterCount || search.trim() ?
    `${formatInt(filteredRows.length)} rows matching the active filters and search.` :
    'No filters are active, so this matches the full dataset.',
    label: 'Export filtered CSV',
    disabled: filteredRows.length === 0,
    onExport: () => {
      exportRows(timestampedName(`${dataset.fileName}-filtered`), columnNames, filteredRows);
      toast.success('CSV exported successfully', { description: `${formatInt(filteredRows.length)} rows written` });
    }
  },
  {
    title: 'SQL results',
    description: lastResult ?
    `Last query returned ${formatInt(lastResult.rowCount)} rows across ${lastResult.columns.length} columns.` :
    'Run a query in the SQL workspace to enable this export.',
    label: 'Export query result',
    disabled: !lastResult || lastResult.rowCount === 0,
    onExport: () => {
      if (!lastResult) return;
      exportRows(timestampedName('query-result'), lastResult.columns, lastResult.rows);
      toast.success('CSV exported successfully', { description: `${formatInt(lastResult.rowCount)} rows written` });
    }
  },
  {
    title: 'Full dataset',
    description: `All ${formatInt(dataset.rowCount)} parsed rows and ${dataset.columnCount} columns, ignoring filters.`,
    label: 'Export current view',
    disabled: false,
    onExport: () => {
      exportRows(timestampedName(dataset.fileName), columnNames, dataset.rows);
      toast.success('CSV exported successfully', { description: `${formatInt(dataset.rowCount)} rows written` });
    }
  }];


  return (
    <>
      <Header
        title="Export"
        subtitle="Download data as CSV with the original column names preserved"
        onOpenNav={onOpenNav}
        showSearch={false} />
      

      <main className="mx-auto w-full max-w-[1100px] flex-1 space-y-4 px-4 py-5 lg:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card) =>
          <Card key={card.title} className="flex flex-col">
              <CardHeader title={card.title} />
              <div className="flex flex-1 flex-col px-5 py-4">
                <p className="text-[13px] leading-5 text-ink-600">{card.description}</p>
                <div className="mt-auto pt-4">
                  <Button
                  variant={card.disabled ? 'secondary' : 'primary'}
                  onClick={card.onExport}
                  disabled={card.disabled}
                  icon={<DownloadIcon size={14} />}>
                  
                    {card.label}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader title="Export format" description="How files are generated" />
          <ul className="space-y-1.5 px-5 py-4 text-[13px] text-ink-600">
            <li>· Comma-separated values with a UTF-8 byte-order mark, so Excel opens accented text correctly.</li>
            <li>· Header row uses the original column names from the uploaded file.</li>
            <li>· Empty, null and missing values are written as empty fields.</li>
            <li>· Files are generated locally in this browser — data is never uploaded.</li>
          </ul>
        </Card>
      </main>
    </>);

}