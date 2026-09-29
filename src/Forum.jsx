import { Link } from 'react-router-dom';
import Button from './Button.jsx';

export default function Forum() {
    return (
        <main className="forum-page">
            <Link className="back-link" to="/">Back to home</Link>
            <h1>Forum</h1>
            <p>Here you can discuss and share your thoughts on various topics.</p>

            <Button className="button--primary">Add New Post</Button>

        </main>
    );
}