/**
 * Module: Album Button
 * Design name: Sidebar album navigation link
 * Code date: 2026-11-12.
 * Programmer: Ian Flack
 *
 * Purpose:
 *   Displays a sidebar link to the album collection.
 *
 * Important functions:
 *   AlbumButton() -> React element: takes no props; returns a NavLink to /albums.
 *
 * Important data structures:
 *   None beyond the static route.
 *
 * Algorithms and design choices:
 *   NavLink supplies route-aware active state for shared sidebar styling.
 */

import { NavLink } from 'react-router-dom';

export default function AlbumButton() {
    return <NavLink to="/albums" className="button button--sidebar-gradient">Albums</NavLink>;
}