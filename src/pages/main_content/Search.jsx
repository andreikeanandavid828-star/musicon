import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * @fileoverview Fetches and displays song results for the query in the URL.
 * @module Search
 * @author Anthony, Ian
 * @date 2026-11-09
 */

/**
 * Reads the `q` query parameter and requests matching songs. An AbortController
 * cancels an outdated request when the query changes or the page unmounts.
 *
 * @returns {React.JSX.Element} Search results and loading/error states.
 */
export default function Search() {
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q')?.trim() || '';

  useEffect(() => {
    if (!query) {
      setSongs([]);
      setSearchError('');
      setIsLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    setSongs([]);
    setIsLoading(true);
    setSearchError('');

    async function fetchSongs() {
      try {
        const params = new URLSearchParams({ q: query, page: '1' });
        const response = await fetch(
          `http://localhost:5000/api/search/songs?${params.toString()}`,
          { signal: controller.signal },
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Unable to search songs.');
        }

        setSongs(Array.isArray(data.songs) ? data.songs.slice(0, 20) : []);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setSongs([]);
          setSearchError(error.message || 'Unable to search songs.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void fetchSongs();
    return () => controller.abort();
  }, [query]);

  return (
    <main className="search-page">
      <section className="search-page__results" aria-labelledby="search-results-heading">
        <h1 id="search-results-heading">Search results</h1>
        {query && <p className="search-page__query">Songs matching “{query}”</p>}
        {!query && <p className="home-empty">Enter a song title in the search bar to get started.</p>}
        {isLoading && <p className="home-empty" role="status">Searching songs…</p>}
        {searchError && <p className="search-page__error" role="alert">{searchError}</p>}
        {!isLoading && !searchError && query && songs.length === 0 && (
          <p className="home-empty">No songs found.</p>
        )}
        {!isLoading && !searchError && songs.length > 0 && (
          <ul className="album-songs search-page__song-list" aria-label="Song search results">
            {songs.map((song) => (
              <li className="search-page__song" key={song.id}>
                <div className="song-artwork album-cover search-page__artwork">
                  {song.albums?.cover_image_url && (
                    <img src={song.albums.cover_image_url} alt="" />
                  )}
                </div>
                <span className="album-songs__title">{song.title}</span>
                <span className="album-songs__artist">
                  {song.artist_name || 'Unknown artist'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}