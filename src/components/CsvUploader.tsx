import React, { useRef, useState } from 'react';
import { AlertCircleIcon, CheckCircle2Icon, FileSpreadsheetIcon, Loader2Icon, UploadCloudIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useDataset } from '../contexts/DatasetContext';
import { parseCsvFile } from '../services/csvParser';
import { Button } from './ui/Button';
import { formatBytes, formatInt } from '../utils/format';

type Status = 'idle' | 'parsing' | 'ready' | 'error';

export function CsvUploader({ compact = false }: {compact?: boolean;}) {
  const { dataset, setDataset } = useDataset();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>(dataset ? 'ready' : 'idle');
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState<{name: string;size: number;} | null>(null);

  const handleFile = async (file: File) => {
    setPending({ name: file.name, size: file.size });
    setStatus('parsing');
    setError('');
    try {
      const next = await parseCsvFile(file);
      setDataset(next);
      setStatus('ready');
      toast.success('CSV uploaded successfully', {
        description: `${formatInt(next.rowCount)} rows × ${next.columnCount} columns analyzed`
      });
      if (next.warnings.length) {
        toast.warning('Some rows were skipped', { description: next.warnings[0] });
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Could not read this file.';
      setStatus('error');
      setError(message);
      toast.error('Upload failed', { description: message });
    }
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const activeFile = dataset ? { name: dataset.fileName, size: dataset.fileSize } : pending;

  return (
    <div className="p-5">
      {!dataset || status === 'parsing' ?
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center rounded-card border-2 border-dashed px-6 text-center transition-colors duration-150 ease-out ${
        compact ? 'py-7' : 'py-12'} ${
        dragging ? 'border-brand-500 bg-brand-50' : 'border-ink-200 bg-ink-50/40'}`}>
        
          {status === 'parsing' ?
        <>
              <Loader2Icon size={22} className="animate-spin text-brand-600" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-ink-900">Parsing and analyzing CSV…</p>
              <p className="mt-1 text-[13px] text-ink-500">
                {pending?.name} · {pending ? formatBytes(pending.size) : ''}
              </p>
            </> :

        <>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-200 bg-white text-brand-600">
                <UploadCloudIcon size={20} aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm font-semibold text-ink-900">Drag & drop your CSV file here</p>
              <p className="mt-1 text-[13px] text-ink-500">
                Everything is parsed and queried in your browser — no data leaves this device.
              </p>
              <Button
            variant="primary"
            className="mt-4"
            onClick={() => inputRef.current?.click()}
            icon={<FileSpreadsheetIcon size={15} />}>
            
                Browse file
              </Button>
            </>
        }
        </div> :

      <div className="flex flex-wrap items-start justify-between gap-4 rounded-card border border-brand-200 bg-brand-50/60 px-4 py-3.5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg border border-brand-200 bg-white text-brand-600">
              <FileSpreadsheetIcon size={17} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink-900">{dataset.fileName}</p>
              <dl className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-ink-600">
                <div className="flex gap-1">
                  <dt className="text-ink-500">Rows:</dt>
                  <dd className="font-medium tabular-nums">{formatInt(dataset.rowCount)}</dd>
                </div>
                <div className="flex gap-1">
                  <dt className="text-ink-500">Columns:</dt>
                  <dd className="font-medium tabular-nums">{dataset.columnCount}</dd>
                </div>
                <div className="flex gap-1">
                  <dt className="text-ink-500">Size:</dt>
                  <dd className="font-medium">{formatBytes(dataset.fileSize)}</dd>
                </div>
                <div className="flex items-center gap-1">
                  <dt className="text-ink-500">Status:</dt>
                  <dd className="flex items-center gap-1 font-medium text-brand-700">
                    <CheckCircle2Icon size={13} aria-hidden="true" /> Ready
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          <Button onClick={() => inputRef.current?.click()}>Replace file</Button>
        </div>
      }

      {status === 'error' && error ?
      <div
        role="alert"
        className="mt-3 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5">
        
          <AlertCircleIcon size={15} className="mt-0.5 flex-shrink-0 text-red-600" aria-hidden="true" />
          <div>
            <p className="text-[13px] font-semibold text-red-800">Could not import this file</p>
            <p className="mt-0.5 text-[12px] leading-5 text-red-700">{error}</p>
          </div>
        </div> :
      null}

      {dataset && dataset.warnings.length ?
      <p className="mt-3 text-[12px] text-amber-700">
          {dataset.warnings.length} parser warning{dataset.warnings.length > 1 ? 's' : ''}: {dataset.warnings[0]}
        </p> :
      null}

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv,.tsv,.txt"
        className="sr-only"
        aria-label="Upload CSV file"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleFile(file);
          event.target.value = '';
        }} />
      
      {activeFile && !dataset && status !== 'parsing' ?
      <p className="mt-3 text-[12px] text-ink-500">
          Selected: {activeFile.name} · {formatBytes(activeFile.size)}
        </p> :
      null}
    </div>);

}