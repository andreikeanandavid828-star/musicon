import { songs } from './songs.jsx';

export default function Home({ selectedSong, onSelectSong }) {
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
              aria-pressed={selectedSong?.id === song.id}
              onClick={() => onSelectSong(song)}
            >
              <span>{song.title}</span>
              <span className="song-list__action">Play</span>
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
