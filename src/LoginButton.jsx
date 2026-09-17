import { Link } from 'react-router-dom';

export default function LoginButton() {
  return (
    <Link to="/login" className="Login-btn">Log in</Link>
  );
}