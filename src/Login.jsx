
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './Button.jsx';

export default function Login({ onLoggedIn }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Password reset popup
  const resetDialogRef = useRef(null);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  function openResetPopup() {
    setResetEmail('');
    setResetMessage('');
    resetDialogRef.current?.showModal();
  }

  function closeResetPopup() {
    resetDialogRef.current?.close();
  }

  function handleResetSubmit(event) {
    event.preventDefault();

    // TODO: Connect to the password reset backend endpoint.
    // Send resetEmail to the backend once it's ready.

    setResetMessage(
      'Password reset emails are not connected yet.'
    );
  }

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
        const serverMessage = [
          result.error,
          result.detail,
          result.message
        ].find((value) => typeof value === 'string');

        setError(
          serverMessage || 'Could not log in. Please try again.'
        );
        return;
      }

      form.reset();
      onLoggedIn?.();
      navigate('/profile', { replace: true });
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

        <Button
          className="button--primary"
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Logging in…' : 'Log in'}
        </Button>
      </form>

      {error && <p role="alert">{error}</p>}

      <p>
        Don't have an account?{' '}
        <Link to="/signup">Sign up</Link>
      </p>

      <p>
        Forgot your password?{' '}
        <button
          type="button"
          className="forgot-password-link"
          onClick={openResetPopup}
        >
          Reset it
        </button>
      </p>

      {/* PASSWORD RESET POPUP */}
      <dialog
        ref={resetDialogRef}
        className="reset-password-modal"
        aria-labelledby="reset-password-title"
      >
        <button
          type="button"
          className="reset-modal-close"
          onClick={closeResetPopup}
          aria-label="Close password reset"
        >
          &times;
        </button>

        <h2 id="reset-password-title">
          Reset your password
        </h2>

        <p className="reset-modal-description">
          Enter the email associated with your Musicon account.
          We'll send you a link to reset your password.
        </p>
        <form
          className="login-form"
          onSubmit={handleResetSubmit}
        >
          <label htmlFor="reset-email">Email address</label>

          <input
            className="form-input"
            id="reset-email"
            name="reset-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={resetEmail}
            onChange={(event) =>
              setResetEmail(event.target.value)
            }
            required
          />

          <Button
            className="button--primary"
            type="submit"
          >
            Send reset link
          </Button>
        </form>

        {resetMessage && (
          <p className="reset-modal-message" role="status">
            {resetMessage}
          </p>
        )}
      </dialog>
    </main>
  );
}
