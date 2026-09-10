import type { ColumnMeta, ColumnType, DataRow } from '../types/dataset';
import { parseDateValue } from '../services/csvParser';

function detect(values: unknown[]): ColumnType {
  const sample = values.filter((value) => value !== null && value !== undefined && value !== '').slice(0, 100);
  if (!sample.length) return 'text';
  if (sample.every((value) => typeof value === 'number')) return 'number';
  if (sample.every((value) => typeof value === 'boolean')) return 'boolean';
  if (sample.every((value) => typeof value === 'string' && parseDateValue(value))) return 'date';
  return 'text';
}

/** Builds minimal column metadata for an arbitrary SQL result set. */
export function inferResultColumns(columns: string[], rows: DataRow[]): ColumnMeta[] {
  return columns.map((name) => ({
    name,
    type: detect(rows.slice(0, 200).map((row) => row[name])),
    uniqueCount: 0,
    emptyCount: 0,
    uniqueValues: [],
    isEnum: false,
    min: null,
    max: null,
    average: null,
    minDate: null,
    maxDate: null
  }));
}