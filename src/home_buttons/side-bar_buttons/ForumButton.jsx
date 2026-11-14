import { NavLink } from 'react-router-dom';

/**
 * @fileoverview Provides sidebar navigation to the forum page.
 * @module ForumButton
 * @author Ian
 * @date 2026-10-20
 */

/** @returns {React.JSX.Element} A link styled as the forum button. */
export default function ForumButton() {
    return <NavLink to="/forum" className="button button--sidebar-gradient">Forum</NavLink>;
}