import Papa from 'papaparse';
import type { DataRow } from '../types/dataset';

export function toCsv(columns: string[], rows: DataRow[]): string {
  return Papa.unparse(
    rows.map((row) => {
      const record: Record<string, unknown> = {};
      for (const column of columns) {
        const value = row[column];
        record[column] = value === null || value === undefined ? '' : value;
      }
      return record;
    }),
    { columns }
  );
}

export function downloadCsv(fileName: string, csv: string): void {
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportRows(fileName: string, columns: string[], rows: DataRow[]): void {
  downloadCsv(fileName, toCsv(columns, rows));
}

export function timestampedName(base: string): string {
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  return `${base.replace(/\.csv$/i, '')}-${stamp}.csv`;
}