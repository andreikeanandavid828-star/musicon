// sends a POST request to /api/auth/register with the email and password, JSON in format {email: string, password: string}. Returns 201 for success, 409 if the email is already registered, or 404 if the endpoint is not found.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button.jsx';

export default function SignUp() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get('email')).trim();
    const password = String(data.get('password'));
    const confirmation = String(data.get('confirmPassword'));

    setError('');
    setCreated(false);

    if (password !== confirmation) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      // Backend: accept POST /api/auth/register with { email, password }.
      // Return 201 for success or 409 if the email is already registered.
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.status === 201) {
        form.reset();
        setCreated(true);
      } else if (response.status === 409) {
        setError('An account already exists with that email.');
      } else if (response.status === 404) {
        setError('');
      } else {
        setError('Could not create your account. Please try again.');
      }
    } catch {
      setError('.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <Link className="back-link" to="/">Back to home</Link>
      <h1>Create an account</h1>

      <form className="login-form" onSubmit={handleSubmit}>
        <label htmlFor="signup-email">Email</label>
        <input
          className="form-input"
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />

        <label htmlFor="signup-password">Password</label>
        <input
          className="form-input"
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />

        <label htmlFor="signup-confirm">Confirm password</label>
        <input
          className="form-input"
          id="signup-confirm"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />

        <Button className="button--primary" type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      {error && <p role="alert">{error}</p>}
      {created && <p role="status">Account created.</p>}
      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </main>
  );
}