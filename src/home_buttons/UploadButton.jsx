import { NavLink } from 'react-router-dom';

export default function UploadButton() {
    return <NavLink to="/upload" className="button button--sidebar-gradient">Upload</NavLink>;
}