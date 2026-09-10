import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export interface LayoutContext {
  onOpenNav: () => void;
}

export function Layout() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex min-h-full w-full bg-ink-50/50">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Outlet context={{ onOpenNav: () => setNavOpen(true) } as LayoutContext} />
      </div>
    </div>);

}