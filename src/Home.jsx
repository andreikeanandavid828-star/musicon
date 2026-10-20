import { songs as catalogSongs } from './songs.jsx';
import SongArtwork from './SongArtwork.jsx';

export default function Home({ songs = catalogSongs, selectedSong, onSelectSong }) {
  return (
    <main className="home-page">
      <h1>Musicon</h1>
      <h2>Available songs</h2>
      <ul className="song-list">
        {songs.map((song) => (
          <li key={song.id}>
            <button
              className="song-list__item"
              type="button"
              disabled={!song.src}
              aria-pressed={selectedSong?.id === song.id}
              onClick={() => onSelectSong(song)}
            >
              <SongArtwork song={song} className="song-artwork--home" />
              <span>{song.title}{song.artist ? ` - ${song.artist}` : ''}</span>
              <span className="song-list__action">{song.src ? 'Play' : 'Uploaded'}</span>
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
