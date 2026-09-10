import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { DatasetProvider } from './contexts/DatasetContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { DataExplorer } from './pages/DataExplorer';
import { Filters } from './pages/Filters';
import { SqlQuery } from './pages/SqlQuery';
import { SavedQueries } from './pages/SavedQueries';
import { Export } from './pages/Export';
import { Settings } from './pages/Settings';

export function App() {
  return (
    <DatasetProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/explorer" element={<DataExplorer />} />
            <Route path="/filters" element={<Filters />} />
            <Route path="/sql" element={<SqlQuery />} />
            <Route path="/saved" element={<SavedQueries />} />
            <Route path="/export" element={<Export />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { fontSize: '13px' } }} />
    </DatasetProvider>);

}