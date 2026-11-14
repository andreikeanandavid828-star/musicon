/**
 * @fileoverview Mounts the React application into the HTML root element.
 * @module main
 * @author Ian, Mariam
 * @date 2026-09-24
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
