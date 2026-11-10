import { NavLink } from 'react-router-dom';

export default function HomeButton() {
  return <NavLink end to="/" className="button button--homebutton">MusicBox</NavLink>;
}
