import React from 'react';
import { createRoot } from 'react-dom/client';
import SidePanel from './sidepanel';

const container = document.getElementById('sidepanel-root');
if (container) {
  const root = createRoot(container);
  root.render(<SidePanel />);
}
