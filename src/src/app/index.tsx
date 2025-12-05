/**
 * Figma Make Entry Point
 * 
 * This file automatically detects if the app is running inside an iframe
 * (preview mode) and renders the preview environment with mock data.
 * 
 * For production, the real app uses /src/main.tsx instead.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import AppPreview from './preview/AppPreview';
import '../styles/globals.css';

// Detect if running inside iframe (Figma Make preview)
const IS_PREVIEW = window.self !== window.top;

if (IS_PREVIEW) {
  console.log('🎨 Figma Make: Preview mode detected, loading mock environment...');
  
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <AppPreview />
      </React.StrictMode>
    );
  }
} else {
  console.log('🚀 Figma Make: Production mode - using /src/main.tsx');
  // Production app is loaded via /src/main.tsx
  // This file does nothing in production mode
}

export default AppPreview;
