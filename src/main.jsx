/**
 * Module: Frontend Entry Point
 * Design name: React root bootstrap
 * Code date: 2026-11-12.
 * Programmer: Mariam Shah
 *
 * Purpose:
 *   Loads global CSS, creates the React root at the HTML `root` element, and
 *   mounts the application in StrictMode.
 *
 * Important functions:
 *   No custom functions are defined. `createRoot(...).render(...)` mounts
 *   App and takes the DOM root and React element as inputs; it returns no
 *   application data.
 *
 * Important data structures:
 *   The root is a React DOM Root; App is the React component tree.
 *
 * Algorithms and design choices:
 *   React StrictMode is used in development to surface lifecycle issues;
 *   no custom algorithm is used.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './css/index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
