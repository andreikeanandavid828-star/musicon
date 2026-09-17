import { Link } from 'react-router-dom';

export default function Login() {
    return (
        <main className="login-page">
            <Link className="back-link" to="/">Back to home</Link>
            <h1>Log in to Musicon</h1>
            <form className="login-form">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" autoComplete="email" required />

                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password" autoComplete="current-password" required />

                <button type="submit">Log in</button>
            </form>
        </main>
    );
}