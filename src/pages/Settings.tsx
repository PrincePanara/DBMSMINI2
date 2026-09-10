import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { ShieldCheckIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import type { LayoutContext } from '../components/Layout';
import { Header } from '../components/Header';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Label, Select } from '../components/ui/Field';
import { useDataset } from '../contexts/DatasetContext';

export function Settings() {
  const { onOpenNav } = useOutletContext<LayoutContext>();
  const { settings, updateSettings, clearDataset, dataset, history, clearHistory } = useDataset();

  return (
    <>
      <Header title="Settings" subtitle="Table preferences and local data" onOpenNav={onOpenNav} showSearch={false} />

      <main className="mx-auto w-full max-w-[820px] flex-1 space-y-4 px-4 py-5 lg:px-6">
        <Card>
          <CardHeader title="Table display" description="Applies to the data explorer, previews and query results." />
          <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="page-size">Rows per page</Label>
              <Select
                id="page-size"
                value={String(settings.pageSize)}
                onChange={(event) => updateSettings({ pageSize: Number(event.target.value) })}
                options={[
                { value: '25', label: '25 rows' },
                { value: '50', label: '50 rows' },
                { value: '100', label: '100 rows' },
                { value: '250', label: '250 rows' }]
                } />
              
              <p className="mt-1.5 text-[12px] text-ink-500">
                Only the current page is rendered, so large datasets stay responsive.
              </p>
            </div>
            <div>
              <Label htmlFor="density">Row density</Label>
              <Select
                id="density"
                value={settings.density}
                onChange={(event) => updateSettings({ density: event.target.value as 'comfortable' | 'compact' })}
                options={[
                { value: 'comfortable', label: 'Comfortable' },
                { value: 'compact', label: 'Compact' }]
                } />
              
              <p className="mt-1.5 text-[12px] text-ink-500">Compact fits roughly 40% more rows per screen.</p>
            </div>
            <label className="flex items-start gap-2.5 sm:col-span-2">
              <input
                type="checkbox"
                checked={settings.stickyHeader}
                onChange={(event) => updateSettings({ stickyHeader: event.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-200" />
              
              <span>
                <span className="block text-[13px] font-medium text-ink-900">Sticky table header</span>
                <span className="block text-[12px] text-ink-500">Keep column headers visible while scrolling.</span>
              </span>
            </label>
          </div>
        </Card>

        <Card className="border-brand-200 bg-brand-50/40">
          <div className="flex items-start gap-2.5 px-5 py-4">
            <ShieldCheckIcon size={16} className="mt-0.5 flex-shrink-0 text-brand-600" aria-hidden="true" />
            <div>
              <p className="text-[13px] font-semibold text-ink-900">Your data stays on this device</p>
              <p className="mt-1 text-[12px] leading-5 text-ink-600">
                CSV parsing, filtering and SQL execution all run in this browser tab. Only saved queries, filter sets
                and display preferences are stored locally; row data is kept in memory and cleared when the tab closes.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Local data" description="Remove what this workspace keeps on your device." />
          <div className="divide-y divide-ink-100">
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5">
              <div>
                <p className="text-[13px] font-medium text-ink-900">Loaded dataset</p>
                <p className="mt-0.5 text-[12px] text-ink-500">
                  {dataset ? `${dataset.fileName} — removes rows, filters and results` : 'No dataset loaded'}
                </p>
              </div>
              <Button
                variant="danger"
                disabled={!dataset}
                onClick={() => {
                  clearDataset();
                  toast.success('Dataset cleared');
                }}
                icon={<Trash2Icon size={14} />}>
                
                Clear dataset
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5">
              <div>
                <p className="text-[13px] font-medium text-ink-900">Query history</p>
                <p className="mt-0.5 text-[12px] text-ink-500">{history.length} recent queries stored</p>
              </div>
              <Button
                variant="danger"
                disabled={!history.length}
                onClick={() => {
                  clearHistory();
                  toast.success('Query history cleared');
                }}
                icon={<Trash2Icon size={14} />}>
                
                Clear history
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </>);

}