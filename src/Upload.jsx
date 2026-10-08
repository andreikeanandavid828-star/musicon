export default function Upload() {
	return (
		<main className="upload-page">
			<label className="button button--primary upload-button">
				Upload a track
				<input
					className="visually-hidden"
					type="file"
					accept="audio/*"
					aria-label="Choose an audio file to upload"
				/>
			</label>
		</main>
	);
}
