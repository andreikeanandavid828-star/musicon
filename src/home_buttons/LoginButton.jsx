/**
 * Module: Login Button
 * Design name: Login navigation link
 * Code date: 2026-11-12.
 * Programmer: Mariam Shah
 *
 * Purpose:
 *   Displays a shared-style navigation link to the login page.
 *
 * Important functions:
 *   LoginButton() -> React element: takes no props; returns a link to /login.
 *
 * Important data structures:
 *   None beyond the static route string.
 *
 * Algorithms and design choices:
 *   Uses React Router Link for client-side navigation without a page reload.
 */

import { Link } from 'react-router-dom';

export default function LoginButton() {
  return <Link to="/login" className="button">Log in</Link>;
}
