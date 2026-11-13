/**
 * Module: Upload Button
 * Design name: Sidebar upload navigation link
 * Code date: 2026-11-12.
 * Programmer: Ian Flack
 *
 * Purpose:
 *   Displays a styled sidebar link to the song upload page.
 *
 * Important functions:
 *   UploadButton() -> React element: takes no props; returns a NavLink to /upload.
 *
 * Important data structures:
 *   None beyond the static route.
 *
 * Algorithms and design choices:
 *   NavLink supplies client-side navigation and route-aware link behavior.
 */

import { NavLink } from 'react-router-dom';

export default function UploadButton() {
    return <NavLink to="/upload" className="button button--sidebar-gradient">Upload</NavLink>;
}