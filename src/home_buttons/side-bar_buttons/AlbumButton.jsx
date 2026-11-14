import { NavLink } from 'react-router-dom';

/**
 * @fileoverview Provides sidebar navigation to the albums page.
 * @module AlbumButton
 * @author Ian, Mariam
 * @date 2026-10-20
 */

/** @returns {React.JSX.Element} A link styled as the albums button. */
export default function AlbumButton() {
    return <NavLink to="/albums" className="button button--sidebar-gradient">Albums</NavLink>;
}