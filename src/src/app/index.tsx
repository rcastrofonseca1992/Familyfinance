/**
 * App Preview Entry Point
 * 
 * Automatically detects if running in Figma Make preview mode (iframe)
 * and shows preview with mock data. Otherwise, returns null and lets
 * the production app handle rendering.
 */

import React from 'react';
import AppPreview from './preview/AppPreview';
import { IS_PREVIEW } from './app.config';

export default function App() {
  // In preview mode (iframe), show AppPreview
  if (IS_PREVIEW) {
    return <AppPreview />;
  }
  
  // In production mode (standalone), return null
  // The production app will handle rendering
  return null;
}