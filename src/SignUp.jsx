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
    const formData = new FormData(form);

    const email = String(formData.get('email')).trim();
    const password = String(formData.get('password'));
    const confirmation = String(formData.get('confirmPassword'));

    setError('');
    setCreated(false);

    if (password !== confirmation) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        'http://localhost:5000/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },

          credentials: "include",

          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(
          result.detail ||
          result.message ||
          'Could not create your account. Please try again.',
        );
        return;
      }

      form.reset();
      setCreated(true);
    } catch {
      setError(
        'Could not connect.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <Link className="back-link" to="/">
        Back to home
      </Link>

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

        <Button
          className="button--primary"
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      {error && <p role="alert">{error}</p>}
      {created && (
        <p role="status">
          Your account has been created successfully.
        </p>
      )}

      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </main>
  );
}