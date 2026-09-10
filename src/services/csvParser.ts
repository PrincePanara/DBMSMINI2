import Papa from 'papaparse';
import type { CellValue, ColumnMeta, ColumnType, DataRow, Dataset } from '../types/dataset';

const ENUM_MAX_UNIQUE = 60;
const TYPE_SAMPLE = 800;

const BOOLEAN_TRUE = new Set(['true', 'yes', 'y']);
const BOOLEAN_FALSE = new Set(['false', 'no', 'n']);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2})?)?/;
const SLASH_DATE = /^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/;
const TEXT_DATE = /^\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}$|^[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4}$/;

export function isBlank(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    typeof value === 'string' && value.trim() === '' ||
    typeof value === 'string' && ['null', 'n/a', 'na', 'nan', '-'].includes(value.trim().toLowerCase()));

}

/** Parses a value into a Date, only for recognised date shapes (never bare numbers). */
export function parseDateValue(raw: unknown): Date | null {
  if (typeof raw === 'number') return null;
  if (typeof raw !== 'string') return null;
  const value = raw.trim();
  if (!value) return null;

  if (ISO_DATE.test(value)) {
    const d = new Date(value.replace(' ', 'T'));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const slash = value.match(SLASH_DATE);
  if (slash) {
    const a = Number(slash[1]);
    const b = Number(slash[2]);
    const year = Number(slash[3]);
    // Prefer day-first when the first part cannot be a month.
    const day = a > 12 ? a : b > 12 ? b : a;
    const month = a > 12 ? b : b > 12 ? a : b;
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const d = new Date(Date.UTC(year, month - 1, day));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (TEXT_DATE.test(value)) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  return null;
}

function toIsoString(d: Date): string {
  const iso = d.toISOString();
  return iso.endsWith('T00:00:00.000Z') ? iso.slice(0, 10) : iso;
}

function isNumeric(value: string): boolean {
  const cleaned = value.replace(/,/g, '').trim();
  if (!cleaned) return false;
  return /^-?\d*\.?\d+(?:[eE][-+]?\d+)?$/.test(cleaned);
}

function toNumber(value: string): number | null {
  const n = Number(value.replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : null;
}

function detectType(samples: string[]): ColumnType {
  if (!samples.length) return 'text';
  let numeric = 0;
  let dates = 0;
  let booleans = 0;
  for (const raw of samples) {
    const value = raw.trim();
    const lower = value.toLowerCase();
    if (BOOLEAN_TRUE.has(lower) || BOOLEAN_FALSE.has(lower)) booleans++;
    if (isNumeric(value)) numeric++;else
    if (parseDateValue(value)) dates++;
  }
  const total = samples.length;
  if (booleans === total) return 'boolean';
  if (numeric === total) return 'number';
  if (dates === total) return 'date';
  return 'text';
}

function coerce(raw: unknown, type: ColumnType): CellValue {
  if (isBlank(raw)) return null;
  const value = String(raw).trim();
  if (type === 'number') return toNumber(value) ?? value;
  if (type === 'boolean') {
    const lower = value.toLowerCase();
    if (BOOLEAN_TRUE.has(lower)) return true;
    if (BOOLEAN_FALSE.has(lower)) return false;
    return value;
  }
  if (type === 'date') {
    const d = parseDateValue(value);
    return d ? toIsoString(d) : value;
  }
  return value;
}

function dedupeHeaders(fields: string[]): string[] {
  const seen = new Map<string, number>();
  return fields.map((field, index) => {
    let name = (field ?? '').trim();
    if (!name) name = `Column_${index + 1}`;
    const count = seen.get(name) ?? 0;
    seen.set(name, count + 1);
    return count === 0 ? name : `${name}_${count + 1}`;
  });
}

export function analyzeRows(headers: string[], rawRows: Record<string, unknown>[]) {
  const types = new Map<string, ColumnType>();
  for (const header of headers) {
    const samples: string[] = [];
    for (let i = 0; i < rawRows.length && samples.length < TYPE_SAMPLE; i++) {
      const value = rawRows[i][header];
      if (!isBlank(value)) samples.push(String(value));
    }
    types.set(header, detectType(samples));
  }

  const rows: DataRow[] = rawRows.map((raw) => {
    const row: DataRow = {};
    for (const header of headers) row[header] = coerce(raw[header], types.get(header) as ColumnType);
    return row;
  });

  const columns: ColumnMeta[] = headers.map((name) => {
    const type = types.get(name) as ColumnType;
    const distinct = new Set<string>();
    let emptyCount = 0;
    let min: number | null = null;
    let max: number | null = null;
    let sum = 0;
    let numericCount = 0;
    let minDate: string | null = null;
    let maxDate: string | null = null;

    for (const row of rows) {
      const value = row[name];
      if (value === null || value === '') {
        emptyCount++;
        continue;
      }
      distinct.add(String(value));

      if (type === 'number' && typeof value === 'number') {
        min = min === null || value < min ? value : min;
        max = max === null || value > max ? value : max;
        sum += value;
        numericCount++;
      } else if (type === 'date' && typeof value === 'string') {
        if (!minDate || value < minDate) minDate = value;
        if (!maxDate || value > maxDate) maxDate = value;
      }
    }

    const uniqueValues = distinct.size <= ENUM_MAX_UNIQUE ? Array.from(distinct).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })) : [];

    return {
      name,
      type,
      uniqueCount: distinct.size,
      emptyCount,
      uniqueValues,
      isEnum: uniqueValues.length > 0 && uniqueValues.length <= ENUM_MAX_UNIQUE,
      min,
      max,
      average: numericCount > 0 ? sum / numericCount : null,
      minDate,
      maxDate
    };
  });

  return { rows, columns };
}

export function parseCsvFile(file: File): Promise<Dataset> {
  return new Promise((resolve, reject) => {
    const name = file.name.toLowerCase();
    if (!name.endsWith('.csv') && !name.endsWith('.tsv') && !name.endsWith('.txt')) {
      reject(new Error('Unsupported file type. Please upload a .csv file.'));
      return;
    }
    if (file.size === 0) {
      reject(new Error('This file is empty. Please upload a CSV with a header row and data.'));
      return;
    }

    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      transformHeader: (header) => header.trim(),
      complete: (result) => {
        try {
          const fields = dedupeHeaders((result.meta.fields ?? []) as string[]);
          if (!fields.length) {
            reject(new Error('No columns detected. The first row must contain column headers.'));
            return;
          }
          const rawRows = (result.data ?? []).filter((row) =>
          Object.values(row).some((value) => !isBlank(value))
          );
          if (!rawRows.length) {
            reject(new Error('The CSV contains headers but no data rows.'));
            return;
          }
          if (fields.length === 1 && rawRows.length > 1) {
            const onlyField = fields[0];
            if (/[;|\t]/.test(onlyField)) {
              reject(new Error('Could not detect a valid delimiter. Please export the file as a comma-separated CSV.'));
              return;
            }
          }

          // Papa keeps the original (pre-dedupe) keys — remap to the deduped headers.
          const originalFields = (result.meta.fields ?? []) as string[];
          const remapped = rawRows.map((row) => {
            const next: Record<string, unknown> = {};
            originalFields.forEach((original, index) => {
              next[fields[index]] = row[original];
            });
            return next;
          });

          const { rows, columns } = analyzeRows(fields, remapped);
          const warnings = (result.errors ?? []).
          slice(0, 5).
          map((error) => `Row ${(error.row ?? 0) + 1}: ${error.message}`);

          resolve({
            fileName: file.name,
            fileSize: file.size,
            rows,
            columns,
            rowCount: rows.length,
            columnCount: columns.length,
            parsedAt: Date.now(),
            warnings
          });
        } catch (error) {
          reject(new Error(error instanceof Error ? error.message : 'Failed to analyze the CSV file.'));
        }
      },
      error: (error) => reject(new Error(error.message || 'Failed to read the CSV file.'))
    });
  });
}