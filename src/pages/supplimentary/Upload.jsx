/**
 * Module: Song Upload Page
 * Design name: Local catalog song entry dialog
 * Code date: 2026-11-12.
 * Programmer: Mariam Shah, Ian Flack
 *
 * Purpose:
 *   Opens a dialog to add a song title and artist to the in-memory Home
 *   catalog. This screen does not upload an audio file to the backend.
 *
 * Important functions:
 *   Upload({ onPostSong }) -> React element: accepts callback used to add a
 *     song record to application state; renders the dialog form.
 *   handlePostSong(event) -> void: reads song/artist fields from FormData,
 *     validates both, invokes onPostSong with a generated ID and metadata,
 *     then navigates Home; invalid values set an error.
 *
 * Important data structures:
 *   FormData contains song and artist strings. Created song objects contain
 *   id, title, and artist. A ref points to the native dialog.
 *
 * Algorithms and design choices:
 *   A timestamp plus random value generates a local unique identifier; the
 *   record is passed to the owner via callback rather than maintained in
 *   duplicate page-local catalog state.
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../Button.jsx';

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
