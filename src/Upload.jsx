import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button.jsx';

export default function Upload({ onPostSong }) {
	const [error, setError] = useState('');
	const dialogRef = useRef(null);
	const navigate = useNavigate();

	useEffect(() => {
		const dialog = dialogRef.current;
		if (dialog && !dialog.open) dialog.showModal();
	}, []);

	function handlePostSong(event) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const songName = formData.get('song').trim();
		const artistName = formData.get('artist').trim();

		if (!songName || !artistName) {
			setError('Enter both a song name and an artist name.');
			return;
		}

		onPostSong({
			id: `${Date.now()}-${Math.random()}`,
			title: songName,
			artist: artistName,
		});
		navigate('/');
	}

	return (
		<main className="upload-page">
			<dialog
				ref={dialogRef}
				className="tierlist-song-picker album-dialog"
				aria-labelledby="song-dialog-title"
				onClose={() => navigate('/')}
			>
				<div className="tierlist-song-picker__header">
					<div>
						<h2 id="song-dialog-title">Upload a song</h2>
						<p>Add a song and artist to the Home catalog.</p>
					</div>
					<Button type="button" onClick={() => dialogRef.current?.close()}>
						Close
					</Button>
				</div>
				<form className="album-form" onSubmit={handlePostSong}>
					<label htmlFor="song-name">Song name</label>
					<input
						className="form-input"
						id="song-name"
						name="song"
						maxLength="120"
						required
						onChange={() => setError('')}
					/>
					<label htmlFor="song-artist">Artist name</label>
					<input
						className="form-input"
						id="song-artist"
						name="artist"
						maxLength="120"
						required
						onChange={() => setError('')}
					/>
					{error && <p className="album-form__error" role="alert">{error}</p>}
					<Button className="button--primary" type="submit">Add song</Button>
				</form>
			</dialog>
		</main>
	);
}
