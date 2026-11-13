/**
 * Module: Home Button
 * Design name: Sidebar home navigation link
 * Code date: 2026-11-12.
 * Programmer: Mariam Shah, Ian Flack
 *
 * Purpose:
 *   Displays the Musicon brand link in the sidebar and marks it active only
 *   at the home route.
 *
 * Important functions:
 *   HomeButton() -> React element: takes no props; returns a NavLink to /.
 *
 * Important data structures:
 *   None beyond the static route.
 *
 * Algorithms and design choices:
 *   NavLink's `end` option prevents the root link from appearing active on
 *   every nested route.
 */

import { NavLink } from 'react-router-dom';

export default function HomeButton() {
  return <NavLink end to="/" className="button button--homebutton">Musicon</NavLink>;
}
