import { NavLink } from 'react-router-dom';

/**
 * @fileoverview Provides sidebar navigation to the home page.
 * @module HomeButton
 * @author Ian
 * @date 2026-10-20
 */

/** @returns {React.JSX.Element} A link styled as the home button. */
export default function HomeButton() {
  return <NavLink end to="/" className="button button--homebutton">MusicBox</NavLink>;
}
