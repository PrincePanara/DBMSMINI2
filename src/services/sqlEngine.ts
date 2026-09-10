// @ts-ignore -- alasql ships its own runtime typings inconsistently across bundlers
import alasql from 'alasql';
import type { DataRow, QueryResultData } from '../types/dataset';

export const TABLE_NAME = 'data';

const BLOCKED = [
'drop',
'delete',
'update',
'insert',
'alter',
'attach',
'detach',
'create',
'truncate',
'grant',
'revoke',
'pragma',
'copy',
'into',
'source',
'require'];


let loadedToken = '';

/** Loads the dataset into the in-memory SQL engine as the `data` table. */
export function loadDataset(rows: DataRow[], token: string): void {
  if (loadedToken === token) return;
  alasql('DROP TABLE IF EXISTS data');
  alasql('CREATE TABLE data');
  alasql.tables[TABLE_NAME].data = rows;
  loadedToken = token;
}

export function resetEngine(): void {
  try {
    alasql('DROP TABLE IF EXISTS data');
  } catch {

    /* ignore */}
  loadedToken = '';
}

/** Returns an error message when the SQL is unsafe or unsupported, otherwise null. */
export function validateSql(sql: string): string | null {
  const trimmed = sql.trim().replace(/;+\s*$/, '');
  if (!trimmed) return 'Write a query before running it.';

  // Strip string literals and bracketed identifiers so column names such as
  // [Last Update] are never mistaken for a write statement.
  const withoutStrings = trimmed.
  replace(/'[^']*'/g, "''").
  replace(/"[^"]*"/g, '""').
  replace(/\[[^\]]*\]/g, 'col').
  replace(/`[^`]*`/g, 'col').
  toLowerCase();

  const statements = withoutStrings.
  split(';').
  map((statement) => statement.trim()).
  filter(Boolean);
  if (statements.length > 1) return 'Only one statement can be executed at a time.';

  if (!/^\s*(select|with)\b/.test(withoutStrings)) {
    return 'Only read-only SELECT queries are allowed in this workspace.';
  }
  for (const keyword of BLOCKED) {
    if (new RegExp(`\\b${keyword}\\b`).test(withoutStrings)) {
      return `The "${keyword.toUpperCase()}" keyword is not allowed — the workspace is read-only.`;
    }
  }
  return null;
}

function normalizeResult(raw: unknown): {columns: string[];rows: DataRow[];} {
  if (raw === null || raw === undefined) return { columns: [], rows: [] };
  if (Array.isArray(raw)) {
    if (!raw.length) return { columns: [], rows: [] };
    if (typeof raw[0] !== 'object' || raw[0] === null) {
      return { columns: ['value'], rows: raw.map((value) => ({ value: value as never })) };
    }
    const columns: string[] = [];
    for (const row of raw.slice(0, 100) as DataRow[]) {
      for (const key of Object.keys(row)) if (!columns.includes(key)) columns.push(key);
    }
    return { columns, rows: raw as DataRow[] };
  }
  if (typeof raw === 'object') {
    const row = raw as DataRow;
    return { columns: Object.keys(row), rows: [row] };
  }
  return { columns: ['value'], rows: [{ value: raw as never }] };
}

export function cleanSqlError(message: string): string {
  const cleaned = message.replace(/^Error:\s*/i, '').replace(/\s+/g, ' ').trim();
  if (/Cannot read propert|undefined/i.test(cleaned)) {
    return 'Could not resolve part of this query. Check that every column name exists in the dataset.';
  }
  if (/Table does not exist|Table.*not found/i.test(cleaned)) {
    return `Unknown table. The uploaded dataset is available as "${TABLE_NAME}".`;
  }
  return cleaned || 'The query could not be executed.';
}

export async function runQuery(sql: string): Promise<QueryResultData> {
  const validation = validateSql(sql);
  if (validation) throw new Error(validation);

  const statement = sql.trim().replace(/;+\s*$/, '');
  // Yield to the browser so loading state paints before the (synchronous) engine runs.
  await new Promise((resolve) => setTimeout(resolve, 0));
  const started = performance.now();
  let raw: unknown;
  try {
    raw = alasql(statement);
  } catch (error) {
    throw new Error(cleanSqlError(error instanceof Error ? error.message : String(error)));
  }
  const durationMs = performance.now() - started;
  const { columns, rows } = normalizeResult(raw);
  return { columns, rows, rowCount: rows.length, durationMs, sql: statement };
}

const KEYWORDS = [
'SELECT',
'FROM',
'WHERE',
'GROUP BY',
'ORDER BY',
'HAVING',
'LIMIT',
'INNER JOIN',
'LEFT JOIN',
'JOIN',
'AND',
'OR'];


export function formatSql(sql: string): string {
  let output = sql.replace(/\s+/g, ' ').trim().replace(/;+$/, '');
  for (const keyword of KEYWORDS) {
    const pattern = new RegExp(`\\s+${keyword.replace(' ', '\\s+')}\\s+`, 'gi');
    const indent = keyword === 'AND' || keyword === 'OR' ? '  ' : '';
    output = output.replace(pattern, `\n${indent}${keyword} `);
  }
  output = output.replace(/,\s*/g, ', ');
  return `${output.trim()};`;
}