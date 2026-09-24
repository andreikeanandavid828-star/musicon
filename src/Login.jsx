import { Link } from 'react-router-dom';
import Button from './Button.jsx';

export default function Login() {
  return (
    <main className="login-page">
      <Link className="back-link" to="/">Back to home</Link>
      <h1>Log in to Musicon</h1>

      <form className="login-form">
        <label htmlFor="email">Email</label>
        <input
          className="form-input"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          className="form-input"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />

        <Button className="button--primary" type="submit">Log in</Button>
      </form>

      <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
    </main>
  );
}