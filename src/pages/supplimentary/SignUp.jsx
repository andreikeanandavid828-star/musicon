/**
 * Module: Signup Page
 * Design name: Account registration form
 * Code date: 2026-11-12.
 * Programmer: Mariam Shah
 *
 * Purpose:
 *   Collects account details, validates password confirmation, submits
 *   registration to the backend, and displays success or error status.
 *
 * Important functions:
 *   SignUp() -> React element: takes no props; renders registration form.
 *   handleSubmit(event) -> Promise<void>: reads email, password,
 *     confirmation, username, first/last name from FormData; validates
 *     matching passwords; submits JSON; resets the form and sets success
 *     state or reports an error.
 *
 * Important data structures:
 *   FormData stores form fields; request JSON is a dictionary of account
 *   values. React state tracks submitting, error, and created status.
 *
 * Algorithms and design choices:
 *   Passwords are compared before any network request. Response JSON parsing
 *   has a fallback for non-JSON responses; a finally block restores the
 *   submitting state.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../Button.jsx';

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
    const username = String(formData.get('username')).trim();
    const firstName = String(formData.get('firstName')).trim();
    const lastName = String(formData.get('lastName')).trim();

    setError('');
    setCreated(false);

    if (password !== confirmation) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },

          credentials: "include",

          body: JSON.stringify({
            email,
            password,
            username,
            firstName,
            lastName,
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

        <label htmlFor="signup-username">Username</label>
        <input
          className="form-input"
          id="signup-username"
          name="username"
          type="text"
          autoComplete="username"
          required
        />

        <label htmlFor="signup-first-name">First name</label>
        <input
          className="form-input"
          id="signup-first-name"
          name="firstName"
          type="text"
          autoComplete="given-name"
          required
        />

        <label htmlFor="signup-last-name">Last name</label>
        <input
          className="form-input"
          id="signup-last-name"
          name="lastName"
          type="text"
          autoComplete="family-name"
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