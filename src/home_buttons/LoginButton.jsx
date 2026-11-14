import { Link } from 'react-router-dom';

/**
 * @fileoverview Provides navigation to the login page.
 * @module LoginButton
 * @author Ian, Mariam
 * @date 2026-09-24
 */

/** @returns {React.JSX.Element} A link styled as the login button. */
export default function LoginButton() {
  return <Link to="/login" className="button">Log in</Link>;
}
