/**
 * Module: Tier List Button
 * Design name: Sidebar tier-list navigation link
 * Code date: 2026-11-12.
 * Programmer: Anthony Langer
 *
 * Purpose:
 *   Displays a sidebar link to the tier-list editor.
 *
 * Important functions:
 *   TierlistButton() -> React element: takes no props; returns a NavLink to
 *   /tierlist.
 *
 * Important data structures:
 *   None beyond the static route.
 *
 * Algorithms and design choices:
 *   NavLink supplies route-aware active state for shared sidebar styling.
 */

import { NavLink } from 'react-router-dom';

export default function TierListButton() {
    return <NavLink to="/tierlist" className="button button--sidebar-gradient">Tier List</NavLink>;
}
