import { Link } from 'react-router-dom';
import Button from './Button.jsx';

export default function TierList() {
    return (
        <main className="tierlist-page">
            <h1>Tier List</h1>
            <p>Here you can make a tier list with any songs you like.</p>

            <Button className="button--primary">Add New Song</Button>

        </main>
    );
}