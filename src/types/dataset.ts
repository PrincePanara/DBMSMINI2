export type ColumnType = 'number' | 'text' | 'date' | 'boolean';

export type CellValue = string | number | boolean | null;

export type DataRow = Record<string, CellValue>;

export interface ColumnMeta {
  name: string;
  type: ColumnType;
  uniqueCount: number;
  emptyCount: number;
  /** Up to 200 distinct values, only kept for low-cardinality columns. */
  uniqueValues: string[];
  /** True when the column has few enough distinct values to offer a multi-select. */
  isEnum: boolean;
  min: number | null;
  max: number | null;
  average: number | null;
  minDate: string | null;
  maxDate: string | null;
}

export interface Dataset {
  fileName: string;
  fileSize: number;
  rows: DataRow[];
  columns: ColumnMeta[];
  rowCount: number;
  columnCount: number;
  parsedAt: number;
  warnings: string[];
}

export type FilterKind = 'text' | 'number' | 'date' | 'values' | 'null';

export interface FilterCondition {
  id: string;
  kind: FilterKind;
  column: string;
  operator: string;
  value: string;
  value2: string;
  values: string[];
}

export interface FilterGroup {
  id: string;
  combinator: 'AND' | 'OR';
  conditions: FilterCondition[];
}

export interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

export interface SavedQuery {
  id: string;
  name: string;
  description: string;
  sql: string;
  createdAt: number;
}

export interface QueryHistoryItem {
  id: string;
  sql: string;
  at: number;
  ok: boolean;
  rowCount: number;
  durationMs: number;
}

export interface QueryResultData {
  columns: string[];
  rows: DataRow[];
  rowCount: number;
  durationMs: number;
  sql: string;
}