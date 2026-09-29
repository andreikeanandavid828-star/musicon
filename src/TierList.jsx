import { Link } from 'react-router-dom';
import Button from './Button.jsx';

export default function TierList() {
    return (
        <main className="tierlist-page">
            <Link className="back-link" to="/">Back to home</Link>
            <h1>Album Tier List</h1>
            <p>Here you can find the tier list for all the albums.</p>

            <Button className="button--primary">Add New Album</Button>

        </main>
    );
}