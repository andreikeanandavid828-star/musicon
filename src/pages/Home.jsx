import { useEffect, useRef, useState } from 'react';
import { songs as catalogSongs } from '../gather_music/songs.jsx';
import SongArtwork from '../gather_music/SongArtwork.jsx';
import { Link } from 'react-router-dom';

/**
 * @fileoverview Renders the song catalog and album summaries on the home page.
 * @module Home
 * @author Anthony, Ian, Mariam
 * @date 2026-10-27
 */

/**
 * Displays available songs and albums and delegates song selection to the app.
 *
 * @param {Object} props - Catalog data and song-selection state.
 * @param {Array<Object>} [props.songs] - Songs to display; defaults to the sample catalog.
 * @param {Array<Object>} [props.albums] - Albums to display.
 * @param {Object|null} props.selectedSong - Currently selected song.
 * @param {Function} props.onSelectSong - Selects a song for playback.
 * @returns {React.JSX.Element} The home page.
 */
export default function Home({
  songs = catalogSongs,
  albums = [],
  selectedSong,
  onSelectSong,
}) {
  const songsRowRef = useRef(null);
  const [canScrollSongsLeft, setCanScrollSongsLeft] = useState(false);
  const [canScrollSongsRight, setCanScrollSongsRight] = useState(false);

  useEffect(() => {
    const row = songsRowRef.current;
    if (!row) return undefined;

    const updateScrollButtons = () => {
      setCanScrollSongsLeft(row.scrollLeft > 0);
      setCanScrollSongsRight(row.scrollLeft + row.clientWidth < row.scrollWidth - 1);
    };

    updateScrollButtons();
    row.addEventListener('scroll', updateScrollButtons, { passive: true });

    const resizeObserver = new ResizeObserver(updateScrollButtons);
    resizeObserver.observe(row);

    return () => {
      row.removeEventListener('scroll', updateScrollButtons);
      resizeObserver.disconnect();
    };
  }, [songs.length]);

  function scrollSongs(direction) {
    const row = songsRowRef.current;
    if (!row) return;

    row.scrollBy({
      left: direction * row.clientWidth * 0.8,
      behavior: 'smooth',
    });
  }

  return (
    <main className="home-page">
      <h1>Musicon</h1>
      <section className="home-section" aria-labelledby="home-songs-heading">
        <h2 id="home-songs-heading">Songs</h2>
        {songs.length === 0 ? (
          <p className="home-empty">No songs available yet.</p>
        ) : (
          <div className="home-song-carousel">
            {canScrollSongsLeft && (
              <button
                className="home-song-carousel__arrow home-song-carousel__arrow--left"
                type="button"
                aria-label="Scroll songs left"
                onClick={() => scrollSongs(-1)}
              >
                ‹
              </button>
            )}
            <ul className="home-card-row" aria-label="Available songs" ref={songsRowRef}>
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
            {canScrollSongsRight && (
              <button
                className="home-song-carousel__arrow home-song-carousel__arrow--right"
                type="button"
                aria-label="Scroll songs right"
                onClick={() => scrollSongs(1)}
              >
                ›
              </button>
            )}
          </div>
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
