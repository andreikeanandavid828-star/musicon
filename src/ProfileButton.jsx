import { Link } from 'react-router-dom';

export default function ProfileButton() {
    return <Link to="/profile" className="button button--sidebar-gradient">Profile</Link>;
}