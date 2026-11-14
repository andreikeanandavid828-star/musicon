import { NavLink } from 'react-router-dom';

/**
 * @fileoverview Provides sidebar navigation to the tier-list page.
 * @module TierListButton
 * @author Ian
 * @date 2026-10-20
 */

/** @returns {React.JSX.Element} A link styled as the tier-list button. */
export default function TierListButton() {
    return <NavLink to="/tierlist" className="button button--sidebar-gradient">Tier List</NavLink>;
}
