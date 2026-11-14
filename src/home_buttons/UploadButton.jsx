import { NavLink } from 'react-router-dom';

/**
 * @fileoverview Provides sidebar navigation to the song upload page.
 * @module UploadButton
 * @author Ian
 * @date 2026-10-20
 */

/** @returns {React.JSX.Element} A link styled as the upload button. */
export default function UploadButton() {
    return <NavLink to="/upload" className="button button--sidebar-gradient">Upload</NavLink>;
}