import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type {
  ColumnMeta,
  DataRow,
  Dataset,
  FilterGroup,
  QueryHistoryItem,
  QueryResultData,
  SavedQuery } from
'../types/dataset';
import { applyFilters, matchesSearch } from '../services/filterEngine';
import { loadDataset, resetEngine } from '../services/sqlEngine';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { uid } from '../utils/format';

const HISTORY_KEY = 'csvsql.history';
const SAVED_KEY = 'csvsql.saved';
const SETTINGS_KEY = 'csvsql.settings';
const FILTERS_KEY = 'csvsql.filterSets';

export interface SavedFilterSet {
  id: string;
  name: string;
  groups: FilterGroup[];
  groupCombinator: 'AND' | 'OR';
  createdAt: number;
}

export interface AppSettings {
  pageSize: number;
  density: 'comfortable' | 'compact';
  stickyHeader: boolean;
}

const DEFAULT_SETTINGS: AppSettings = { pageSize: 50, density: 'comfortable', stickyHeader: true };

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {

    /* storage unavailable */}
}

export function createEmptyGroup(): FilterGroup {
  return { id: uid('group'), combinator: 'AND', conditions: [] };
}

interface DatasetContextValue {
  dataset: Dataset | null;
  columns: ColumnMeta[];
  setDataset: (dataset: Dataset | null) => void;
  clearDataset: () => void;

  draftGroups: FilterGroup[];
  setDraftGroups: React.Dispatch<React.SetStateAction<FilterGroup[]>>;
  appliedGroups: FilterGroup[];
  groupCombinator: 'AND' | 'OR';
  setGroupCombinator: (combinator: 'AND' | 'OR') => void;
  applyDraftFilters: () => number;
  clearFilters: () => void;
  removeAppliedCondition: (groupId: string, conditionId: string) => void;
  hasPendingChanges: boolean;
  activeFilterCount: number;

  savedFilterSets: SavedFilterSet[];
  saveFilterSet: (name: string) => void;
  applyFilterSet: (id: string) => void;
  deleteFilterSet: (id: string) => void;

  search: string;
  setSearch: (value: string) => void;
  debouncedSearch: string;

  filteredRows: DataRow[];
  isFiltering: boolean;

  savedQueries: SavedQuery[];
  saveQuery: (query: Omit<SavedQuery, 'id' | 'createdAt'>) => void;
  updateSavedQuery: (id: string, patch: Partial<Omit<SavedQuery, 'id'>>) => void;
  deleteSavedQuery: (id: string) => void;
  duplicateSavedQuery: (id: string) => void;

  lastResult: QueryResultData | null;
  setLastResult: (result: QueryResultData | null) => void;

  history: QueryHistoryItem[];
  pushHistory: (item: Omit<QueryHistoryItem, 'id' | 'at'>) => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;

  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

const DatasetContext = createContext<DatasetContextValue | null>(null);

export function DatasetProvider({ children }: {children: React.ReactNode;}) {
  const [dataset, setDatasetState] = useState<Dataset | null>(null);
  const [draftGroups, setDraftGroups] = useState<FilterGroup[]>([createEmptyGroup()]);
  const [appliedGroups, setAppliedGroups] = useState<FilterGroup[]>([]);
  const [groupCombinator, setGroupCombinator] = useState<'AND' | 'OR'>('AND');
  const [search, setSearch] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);
  const [lastResult, setLastResult] = useState<QueryResultData | null>(null);

  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>(() => readStorage<SavedQuery[]>(SAVED_KEY, []));
  const [history, setHistory] = useState<QueryHistoryItem[]>(() => readStorage<QueryHistoryItem[]>(HISTORY_KEY, []));
  const [settings, setSettings] = useState<AppSettings>(() => readStorage<AppSettings>(SETTINGS_KEY, DEFAULT_SETTINGS));
  const [savedFilterSets, setSavedFilterSets] = useState<SavedFilterSet[]>(() =>
  readStorage<SavedFilterSet[]>(FILTERS_KEY, [])
  );

  const debouncedSearch = useDebouncedValue(search, 250);

  useEffect(() => writeStorage(SAVED_KEY, savedQueries), [savedQueries]);
  useEffect(() => writeStorage(HISTORY_KEY, history), [history]);
  useEffect(() => writeStorage(SETTINGS_KEY, settings), [settings]);
  useEffect(() => writeStorage(FILTERS_KEY, savedFilterSets), [savedFilterSets]);

  useEffect(() => {
    if (dataset) loadDataset(dataset.rows, `${dataset.fileName}-${dataset.parsedAt}`);else
    resetEngine();
  }, [dataset]);

  useEffect(() => {
    if (search === debouncedSearch) {
      setIsFiltering(false);
      return;
    }
    setIsFiltering(true);
  }, [search, debouncedSearch]);

  const setDataset = useCallback((next: Dataset | null) => {
    setDatasetState(next);
    setDraftGroups([createEmptyGroup()]);
    setAppliedGroups([]);
    setGroupCombinator('AND');
    setSearch('');
    setLastResult(null);
  }, []);

  const clearDataset = useCallback(() => setDataset(null), [setDataset]);

  const columns = useMemo(() => dataset?.columns ?? [], [dataset]);

  const filteredRows = useMemo(() => {
    if (!dataset) return [];
    const afterFilters = applyFilters(dataset.rows, appliedGroups, groupCombinator);
    if (!debouncedSearch.trim()) return afterFilters;
    return afterFilters.filter((row) => matchesSearch(row, dataset.columns, debouncedSearch));
  }, [dataset, appliedGroups, groupCombinator, debouncedSearch]);

  const activeFilterCount = useMemo(
    () => appliedGroups.reduce((total, group) => total + group.conditions.length, 0),
    [appliedGroups]
  );

  const hasPendingChanges = useMemo(
    () => JSON.stringify(draftGroups) !== JSON.stringify(appliedGroups),
    [draftGroups, appliedGroups]
  );

  const applyDraftFilters = useCallback(() => {
    const cleaned = draftGroups.
    map((group) => ({ ...group, conditions: group.conditions.filter((condition) => condition.column) })).
    filter((group) => group.conditions.length > 0);
    setAppliedGroups(cleaned);
    return cleaned.reduce((total, group) => total + group.conditions.length, 0);
  }, [draftGroups]);

  const clearFilters = useCallback(() => {
    setDraftGroups([createEmptyGroup()]);
    setAppliedGroups([]);
    setGroupCombinator('AND');
  }, []);

  const removeAppliedCondition = useCallback((groupId: string, conditionId: string) => {
    const strip = (groups: FilterGroup[]) =>
    groups.
    map((group) =>
    group.id === groupId ?
    { ...group, conditions: group.conditions.filter((condition) => condition.id !== conditionId) } :
    group
    ).
    filter((group, index, all) => group.conditions.length > 0 || all.length === 1);
    setAppliedGroups((groups) => strip(groups).filter((group) => group.conditions.length > 0));
    setDraftGroups((groups) => {
      const next = strip(groups);
      return next.length ? next : [createEmptyGroup()];
    });
  }, []);

  const saveFilterSet = useCallback(
    (name: string) => {
      const cleaned = draftGroups.
      map((group) => ({ ...group, conditions: group.conditions.filter((condition) => condition.column) })).
      filter((group) => group.conditions.length > 0);
      if (!cleaned.length) return;
      setSavedFilterSets((sets) => [
      { id: uid('fset'), name, groups: cleaned, groupCombinator, createdAt: Date.now() },
      ...sets]
      );
    },
    [draftGroups, groupCombinator]
  );

  const applyFilterSet = useCallback(
    (id: string) => {
      const set = savedFilterSets.find((item) => item.id === id);
      if (!set) return;
      setDraftGroups(set.groups);
      setAppliedGroups(set.groups);
      setGroupCombinator(set.groupCombinator);
    },
    [savedFilterSets]
  );

  const deleteFilterSet = useCallback((id: string) => {
    setSavedFilterSets((sets) => sets.filter((set) => set.id !== id));
  }, []);

  const saveQuery = useCallback((query: Omit<SavedQuery, 'id' | 'createdAt'>) => {
    setSavedQueries((queries) => [{ ...query, id: uid('query'), createdAt: Date.now() }, ...queries]);
  }, []);

  const updateSavedQuery = useCallback((id: string, patch: Partial<Omit<SavedQuery, 'id'>>) => {
    setSavedQueries((queries) => queries.map((query) => query.id === id ? { ...query, ...patch } : query));
  }, []);

  const deleteSavedQuery = useCallback((id: string) => {
    setSavedQueries((queries) => queries.filter((query) => query.id !== id));
  }, []);

  const duplicateSavedQuery = useCallback((id: string) => {
    setSavedQueries((queries) => {
      const original = queries.find((query) => query.id === id);
      if (!original) return queries;
      return [
      { ...original, id: uid('query'), name: `${original.name} (copy)`, createdAt: Date.now() },
      ...queries];

    });
  }, []);

  const pushHistory = useCallback((item: Omit<QueryHistoryItem, 'id' | 'at'>) => {
    setHistory((items) => [{ ...item, id: uid('hist'), at: Date.now() }, ...items].slice(0, 25));
  }, []);

  const deleteHistoryItem = useCallback((id: string) => {
    setHistory((items) => items.filter((item) => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  const value: DatasetContextValue = {
    dataset,
    columns,
    setDataset,
    clearDataset,
    draftGroups,
    setDraftGroups,
    appliedGroups,
    groupCombinator,
    setGroupCombinator,
    applyDraftFilters,
    clearFilters,
    removeAppliedCondition,
    hasPendingChanges,
    activeFilterCount,
    savedFilterSets,
    saveFilterSet,
    applyFilterSet,
    deleteFilterSet,
    search,
    setSearch,
    debouncedSearch,
    filteredRows,
    isFiltering,
    savedQueries,
    saveQuery,
    updateSavedQuery,
    deleteSavedQuery,
    duplicateSavedQuery,
    lastResult,
    setLastResult,
    history,
    pushHistory,
    deleteHistoryItem,
    clearHistory,
    settings,
    updateSettings
  };

  return <DatasetContext.Provider value={value}>{children}</DatasetContext.Provider>;
}

export function useDataset(): DatasetContextValue {
  const context = useContext(DatasetContext);
  if (!context) throw new Error('useDataset must be used inside a DatasetProvider');
  return context;
}