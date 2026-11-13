/**
 * Module: Signup Button
 * Design name: Signup navigation link
 * Code date: 2026-11-12.
 * Programmer: Mariam Shah
 *
 * Purpose:
 *   Displays a shared-style navigation link to account registration.
 *
 * Important functions:
 *   SignupButton() -> React element: takes no props; returns a link to /signup.
 *
 * Important data structures:
 *   None beyond the static route string.
 *
 * Algorithms and design choices:
 *   Uses React Router Link for client-side navigation without a page reload.
 */

import { Link } from 'react-router-dom';

export default function SignupButton() {
    return <Link to="/signup" className="button button--signup">Sign up</Link>;
}
