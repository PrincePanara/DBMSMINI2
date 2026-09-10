import type { CellValue, ColumnType } from '../types/dataset';

export function formatInt(n: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(n));
}

export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return '—';
  const abs = Math.abs(n);
  const decimals = Number.isInteger(n) ? 0 : abs < 1 ? 4 : 2;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(n);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatCell(value: CellValue, type: ColumnType): string {
  if (value === null || value === undefined || value === '') return '';
  if (type === 'number' && typeof value === 'number') return formatNumber(value);
  if (type === 'boolean') return value ? 'true' : 'false';
  if (type === 'date' && typeof value === 'string') {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      const hasTime = value.includes('T') && !value.endsWith('T00:00:00.000Z');
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        ...(hasTime ? { hour: '2-digit', minute: '2-digit' } : {})
      });
    }
  }
  return String(value);
}

export function typeLabel(type: ColumnType): string {
  switch (type) {
    case 'number':
      return 'Number';
    case 'date':
      return 'Date';
    case 'boolean':
      return 'Boolean';
    default:
      return 'Text';
  }
}

export function uid(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}