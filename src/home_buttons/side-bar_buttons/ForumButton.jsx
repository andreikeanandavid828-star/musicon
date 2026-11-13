/**
 * Module: Forum Button
 * Design name: Sidebar forum navigation link
 * Code date: 2026-11-12.
 * Programmer: Anthony Langer
 *
 * Purpose:
 *   Displays a sidebar link to the forum.
 *
 * Important functions:
 *   ForumButton() -> React element: takes no props; returns a NavLink to /forum.
 *
 * Important data structures:
 *   None beyond the static route.
 *
 * Algorithms and design choices:
 *   NavLink supplies route-aware active state for shared sidebar styling.
 */

import { NavLink } from 'react-router-dom';

export default function ForumButton() {
    return <NavLink to="/forum" className="button button--sidebar-gradient">Forum</NavLink>;
}