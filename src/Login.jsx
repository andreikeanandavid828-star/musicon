import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import Button from './Button.jsx';

export default function Login() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // 2. Initialize the hook

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get('email')).trim();
    const password = String(formData.get('password'));

    setError('');
    setSubmitting(true);

    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/login', 
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        },
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const serverMessage = [result.error, result.detail, result.message]
          .find((value) => typeof value === 'string');

        setError(serverMessage || 'Could not log in. Please try again.');
        return;
      }

      form.reset();
      navigate('/forum'); // 3. Redirect user to your main feed/dashboard route
    } catch {
      setError('Could not connect.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <h1>Log in to Musicon</h1>

      <form className="login-form" onSubmit={handleSubmit}>
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

        <Button className="button--primary" type="submit" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </Button>
      </form>

      {error && <p role="alert">{error}</p>}

      <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
    </main>
  );
}