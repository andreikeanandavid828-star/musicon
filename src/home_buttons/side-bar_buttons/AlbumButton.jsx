import { NavLink } from 'react-router-dom';

export default function AlbumButton() {
    return <NavLink to="/albums" className="button button--sidebar-gradient">Albums</NavLink>;
}