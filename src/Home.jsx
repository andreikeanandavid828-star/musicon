import { songs as catalogSongs } from './songs.jsx';
import SongArtwork from './SongArtwork.jsx';
import { Link } from 'react-router-dom';

export default function Home({
  songs = catalogSongs,
  albums = [],
  selectedSong,
  onSelectSong,
}) {
  return (
    <main className="home-page">
      <h1>Musicon</h1>
      <section className="home-section" aria-labelledby="home-songs-heading">
        <h2 id="home-songs-heading">Songs</h2>
        {songs.length === 0 ? (
          <p className="home-empty">No songs available yet.</p>
        ) : (
          <ul className="home-card-row" aria-label="Available songs">
            {songs.map((song) => (
              <li className="home-card" key={song.id}>
                <button
                  className="home-card__button"
                  type="button"
                  disabled={!song.src}
                  aria-label={`Play ${song.title}${song.artist ? ` by ${song.artist}` : ''}`}
                  aria-pressed={selectedSong?.id === song.id}
                  onClick={() => onSelectSong(song)}
                >
                  <SongArtwork song={song} className="home-card__artwork" />
                  <span className="home-card__title">{song.title}</span>
                  {song.artist && <span className="home-card__subtitle">{song.artist}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="home-section" aria-labelledby="home-playlists-heading">
        <div className="home-section__heading">
          <h2 id="home-playlists-heading">Playlists</h2>
          <Link className="home-section__link" to="/albums">Browse all</Link>
        </div>
        {albums.length === 0 ? (
          <p className="home-empty">
            No playlists yet. <Link to="/albums">Create one in Albums</Link>.
          </p>
        ) : (
          <ul className="home-card-row" aria-label="Playlists">
            {albums.map((album) => {
              const coverSong = (album.songIds || [])
                .map((songId) => songs.find((song) => song.id === songId))
                .find(Boolean);

              return (
                <li className="home-card" key={album.id}>
                  <Link className="home-card__link" to={`/albums/${album.id}`}>
                    <SongArtwork song={coverSong} className="home-card__artwork" />
                    <span className="home-card__title">{album.name}</span>
                    <span className="home-card__subtitle">
                      {(album.songIds || []).length} songs
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
