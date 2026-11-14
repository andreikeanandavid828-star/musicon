import { Link } from 'react-router-dom';

/**
 * @fileoverview Provides navigation to the signup page.
 * @module SignupButton
 * @author Ian, Mariam
 * @date 2026-10-01
 */

/** @returns {React.JSX.Element} A link styled as the signup button. */
export default function SignupButton() {
    return <Link to="/signup" className="button button--signup">Sign up</Link>;
}
