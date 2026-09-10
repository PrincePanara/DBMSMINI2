import type {
  CellValue,
  ColumnMeta,
  ColumnType,
  DataRow,
  FilterCondition,
  FilterGroup,
  FilterKind,
  SortState } from
'../types/dataset';
import { parseDateValue } from './csvParser';
import { formatCell } from '../utils/format';

export const TEXT_OPERATORS = [
{ value: 'contains', label: 'Contains' },
{ value: 'not_contains', label: 'Does not contain' },
{ value: 'equals', label: 'Equals' },
{ value: 'not_equals', label: 'Does not equal' },
{ value: 'starts_with', label: 'Starts with' },
{ value: 'ends_with', label: 'Ends with' },
{ value: 'is_empty', label: 'Is empty' },
{ value: 'is_not_empty', label: 'Is not empty' }];


export const NUMBER_OPERATORS = [
{ value: 'equals', label: 'Equals' },
{ value: 'not_equals', label: 'Not equal' },
{ value: 'gt', label: 'Greater than' },
{ value: 'gte', label: 'Greater than or equal' },
{ value: 'lt', label: 'Less than' },
{ value: 'lte', label: 'Less than or equal' },
{ value: 'between', label: 'Between' },
{ value: 'is_empty', label: 'Is empty' },
{ value: 'is_not_empty', label: 'Is not empty' }];


export const DATE_OPERATORS = [
{ value: 'before', label: 'Before' },
{ value: 'after', label: 'After' },
{ value: 'on', label: 'On' },
{ value: 'between', label: 'Between' },
{ value: 'today', label: 'Today' },
{ value: 'yesterday', label: 'Yesterday' },
{ value: 'this_week', label: 'This week' },
{ value: 'this_month', label: 'This month' },
{ value: 'this_year', label: 'This year' },
{ value: 'is_empty', label: 'Is empty' },
{ value: 'is_not_empty', label: 'Is not empty' }];


export const NULL_OPERATORS = [
{ value: 'is_empty', label: 'Is empty' },
{ value: 'is_not_empty', label: 'Is not empty' }];


export function operatorsForKind(kind: FilterKind) {
  switch (kind) {
    case 'text':
      return TEXT_OPERATORS;
    case 'number':
      return NUMBER_OPERATORS;
    case 'date':
      return DATE_OPERATORS;
    case 'null':
      return NULL_OPERATORS;
    default:
      return [{ value: 'in', label: 'Is any of' }];
  }
}

export function operatorLabel(kind: FilterKind, operator: string): string {
  return operatorsForKind(kind).find((option) => option.value === operator)?.label ?? operator;
}

export function kindForType(type: ColumnType): FilterKind {
  if (type === 'number') return 'number';
  if (type === 'date') return 'date';
  if (type === 'boolean') return 'values';
  return 'text';
}

function isEmptyValue(value: CellValue): boolean {
  return value === null || value === undefined || value === '';
}

/**
 * Day boundaries are computed in UTC because parsed date cells are normalised to
 * UTC midnight, while the calendar day itself comes from the viewer's local clock.
 */
function startOfDay(d: Date): number {
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
}

function dayRangeFor(operator: string): [number, number] | null {
  const now = new Date();
  const today = startOfDay(now);
  const day = 86400000;
  switch (operator) {
    case 'today':
      return [today, today + day - 1];
    case 'yesterday':
      return [today - day, today - 1];
    case 'this_week':{
        const weekday = (now.getDay() + 6) % 7;
        const start = today - weekday * day;
        return [start, start + 7 * day - 1];
      }
    case 'this_month':{
        const start = Date.UTC(now.getFullYear(), now.getMonth(), 1);
        const end = Date.UTC(now.getFullYear(), now.getMonth() + 1, 1) - 1;
        return [start, end];
      }
    case 'this_year':{
        const start = Date.UTC(now.getFullYear(), 0, 1);
        const end = Date.UTC(now.getFullYear() + 1, 0, 1) - 1;
        return [start, end];
      }
    default:
      return null;
  }
}

function toTimestamp(value: CellValue): number | null {
  if (typeof value !== 'string') return null;
  const d = parseDateValue(value) ?? new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
}

export function isConditionComplete(condition: FilterCondition): boolean {
  if (!condition.column) return false;
  const { kind, operator, value, value2, values } = condition;
  if (operator === 'is_empty' || operator === 'is_not_empty') return true;
  if (kind === 'values') return values.length > 0;
  if (kind === 'date' && dayRangeFor(operator)) return true;
  if (operator === 'between') return value.trim() !== '' && value2.trim() !== '';
  return value.trim() !== '';
}

export function evaluateCondition(row: DataRow, condition: FilterCondition): boolean {
  const value = row[condition.column];
  const { kind, operator } = condition;

  if (operator === 'is_empty') return isEmptyValue(value);
  if (operator === 'is_not_empty') return !isEmptyValue(value);

  if (kind === 'values') {
    if (isEmptyValue(value)) return condition.values.includes('');
    return condition.values.includes(String(value));
  }

  if (kind === 'number') {
    const target = Number(condition.value);
    const num = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(num)) return false;
    switch (operator) {
      case 'equals':
        return num === target;
      case 'not_equals':
        return num !== target;
      case 'gt':
        return num > target;
      case 'gte':
        return num >= target;
      case 'lt':
        return num < target;
      case 'lte':
        return num <= target;
      case 'between':{
          const low = Math.min(Number(condition.value), Number(condition.value2));
          const high = Math.max(Number(condition.value), Number(condition.value2));
          return num >= low && num <= high;
        }
      default:
        return true;
    }
  }

  if (kind === 'date') {
    const ts = toTimestamp(value);
    if (ts === null) return false;
    const preset = dayRangeFor(operator);
    if (preset) return ts >= preset[0] && ts <= preset[1];
    const target = condition.value ? new Date(condition.value).getTime() : null;
    if (target === null || Number.isNaN(target)) return false;
    switch (operator) {
      case 'before':
        return ts < target;
      case 'after':
        return ts >= target + 86400000;
      case 'on':
        return ts >= target && ts < target + 86400000;
      case 'between':{
          const end = condition.value2 ? new Date(condition.value2).getTime() : null;
          if (end === null || Number.isNaN(end)) return false;
          const low = Math.min(target, end);
          const high = Math.max(target, end) + 86400000 - 1;
          return ts >= low && ts <= high;
        }
      default:
        return true;
    }
  }

  const haystack = isEmptyValue(value) ? '' : String(value).toLowerCase();
  const needle = condition.value.trim().toLowerCase();
  switch (operator) {
    case 'contains':
      return haystack.includes(needle);
    case 'not_contains':
      return !haystack.includes(needle);
    case 'equals':
      return haystack === needle;
    case 'not_equals':
      return haystack !== needle;
    case 'starts_with':
      return haystack.startsWith(needle);
    case 'ends_with':
      return haystack.endsWith(needle);
    default:
      return true;
  }
}

export function matchesSearch(row: DataRow, columns: ColumnMeta[], query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  for (const column of columns) {
    const value = row[column.name];
    if (isEmptyValue(value)) continue;
    if (String(value).toLowerCase().includes(needle)) return true;
    if (column.type === 'date' && formatCell(value, column.type).toLowerCase().includes(needle)) return true;
  }
  return false;
}

export function applyFilters(
rows: DataRow[],
groups: FilterGroup[],
groupCombinator: 'AND' | 'OR')
: DataRow[] {
  const activeGroups = groups.
  map((group) => ({ ...group, conditions: group.conditions.filter(isConditionComplete) })).
  filter((group) => group.conditions.length > 0);

  if (!activeGroups.length) return rows;

  return rows.filter((row) => {
    const results = activeGroups.map((group) =>
    group.combinator === 'AND' ?
    group.conditions.every((condition) => evaluateCondition(row, condition)) :
    group.conditions.some((condition) => evaluateCondition(row, condition))
    );
    return groupCombinator === 'AND' ? results.every(Boolean) : results.some(Boolean);
  });
}

export function sortRows(rows: DataRow[], sort: SortState | null, columns: ColumnMeta[]): DataRow[] {
  if (!sort) return rows;
  const type = columns.find((column) => column.name === sort.column)?.type ?? 'text';
  const factor = sort.direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const left = a[sort.column];
    const right = b[sort.column];
    const leftEmpty = isEmptyValue(left);
    const rightEmpty = isEmptyValue(right);
    if (leftEmpty && rightEmpty) return 0;
    if (leftEmpty) return 1;
    if (rightEmpty) return -1;
    if (type === 'number') return ((left as number) - (right as number)) * factor;
    if (type === 'boolean') return (Number(left) - Number(right)) * factor;
    return String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' }) * factor;
  });
}

export function describeCondition(condition: FilterCondition): string {
  const label = operatorLabel(condition.kind, condition.operator);
  if (condition.operator === 'is_empty' || condition.operator === 'is_not_empty') {
    return `${condition.column} ${label.toLowerCase()}`;
  }
  if (condition.kind === 'values') {
    const shown = condition.values.slice(0, 2).map((value) => value === '' ? '(empty)' : value);
    const extra = condition.values.length - shown.length;
    return `${condition.column} = ${shown.join(', ')}${extra > 0 ? ` +${extra}` : ''}`;
  }
  if (condition.operator === 'between') {
    return `${condition.column} between ${condition.value} → ${condition.value2}`;
  }
  if (condition.kind === 'date' && dayRangeFor(condition.operator)) {
    return `${condition.column} is ${label.toLowerCase()}`;
  }
  const symbols: Record<string, string> = {
    equals: '=',
    not_equals: '≠',
    gt: '>',
    gte: '≥',
    lt: '<',
    lte: '≤'
  };
  if (symbols[condition.operator] && condition.kind === 'number') {
    return `${condition.column} ${symbols[condition.operator]} ${condition.value}`;
  }
  return `${condition.column} ${label.toLowerCase()} "${condition.value}"`;
}