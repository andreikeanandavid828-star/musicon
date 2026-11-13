/**
 * Module: Home Page
 * Design name: Song and playlist catalog view
 * Code date: 2026-11-12.
 * Programmer: Mariam Shah, Ian Flack, Anthony Langer
 *
 * Purpose:
 *   Shows available songs and albums/playlists, with playback selection and
 *   navigation to album details.
 *
 * Important functions:
 *   Home({ songs, albums, selectedSong, onSelectSong }) -> React element:
 *     accepts song and album arrays, selected song or null, and a song
 *     selection callback; renders catalog cards and empty states.
 *   The inline cover-song lookup maps an album's song IDs to catalog records
 *     and selects the first available record; it returns a song or undefined.
 *
 * Important data structures:
 *   Song records use id/title/src/artist fields; album records use id/name/
 *   songIds. Arrays are rendered as keyed lists.
 *
 * Algorithms and design choices:
 *   Album cover art uses the first album song found in the catalog. Missing
 *   songs are filtered by selecting the first truthy match, avoiding broken
 *   artwork references.
 */

import { songs as catalogSongs } from '../gather_music/songs.jsx';
import SongArtwork from '../gather_music/SongArtwork.jsx';
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
