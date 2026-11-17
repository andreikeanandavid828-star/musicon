import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const COMMON_GENRE_ORDER = ['Pop', 'R&B', 'Hip Hop', 'Dance/Electronic', 'Rock'];
const genreCoverFiles = import.meta.glob('../../assets/7_genre_song_covers/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});
const genreCovers = Object.fromEntries(
  Object.entries(genreCoverFiles).map(([path, url]) => {
    const fileName = path.split('/').pop().replace(/\.png$/i, '');
    return [fileName.toLocaleLowerCase().replace(/[^a-z0-9]/g, ''), url];
  }),
);

function getSongGenres(genre) {
  const values = Array.isArray(genre) ? genre : [genre];
  return values
    .flatMap((value) => typeof value === 'string' ? value.split(/[,;|\n]+/) : [])
    .map((value) => value.trim())
    .filter(Boolean);
}

function getGenreCover(song, selectedGenre) {
  const songGenres = getSongGenres(song.genre);
  const genre = selectedGenre === 'all'
    ? songGenres[0]
    : songGenres.find(
      (songGenre) => songGenre.toLocaleLowerCase() === selectedGenre.toLocaleLowerCase(),
    );
  if (!genre) return null;

  let genreKey = genre.toLocaleLowerCase().replace(/[^a-z0-9]/g, '');
  if (['dance', 'electronic', 'edm'].includes(genreKey)) {
    genreKey = 'danceelectronic';
  }

  return genreCovers[genreKey] || null;
}

function formatGenreLabel(genre) {
  return genre.charAt(0).toLocaleUpperCase() + genre.slice(1);
}

/**
 * @fileoverview Fetches and displays song and artist results for the query in
 * the URL, with genre filtering for songs.
 * @module Search
 * @author Anthony, Ian
 * @date 2026-11-09
 */

/**
 * Reads the `q` query parameter and requests matching songs and artists.
 * Song results can be filtered by the genres returned by the API. An
 * AbortController cancels outdated requests when the query changes or the
 * page unmounts.
 *
 * @returns {React.JSX.Element} Search results and loading/error states.
 */
export default function Search() {
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [activeResultType, setActiveResultType] = useState('songs');
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [isLoadingArtists, setIsLoadingArtists] = useState(false);
  const [songError, setSongError] = useState('');
  const [artistError, setArtistError] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q')?.trim() || '';

  useEffect(() => {
    setSelectedGenre('all');
    setActiveResultType('songs');
    if (!query) {
      setSongs([]);
      setArtists([]);
      setSongError('');
      setArtistError('');
      setIsLoadingSongs(false);
      setIsLoadingArtists(false);
      return undefined;
    }

    const controller = new AbortController();
    setSongs([]);
    setArtists([]);
    setIsLoadingSongs(true);
    setIsLoadingArtists(true);
    setSongError('');
    setArtistError('');

    async function fetchResults(type, setResults, setError, setLoading, resultKey, fallbackError) {
      try {
        const params = new URLSearchParams({ q: query, page: '1' });
        const response = await fetch(
          `http://localhost:5000/api/search/${type}?${params.toString()}`,
          { signal: controller.signal },
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || fallbackError);
        }

        setResults(Array.isArray(data[resultKey]) ? data[resultKey].slice(0, 20) : []);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setResults([]);
          setError(error.message || fallbackError);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchResults(
      'songs',
      setSongs,
      setSongError,
      setIsLoadingSongs,
      'songs',
      'Unable to search songs.',
    );
    void fetchResults(
      'artists',
      setArtists,
      setArtistError,
      setIsLoadingArtists,
      'artists',
      'Unable to search artists.',
    );
    return () => controller.abort();
  }, [query]);

  const genreByKey = new Map();
  songs.forEach((song) => {
    getSongGenres(song.genre).forEach((genre) => {
      const key = genre.toLocaleLowerCase();
      if (!genreByKey.has(key)) genreByKey.set(key, genre);
    });
  });
  const availableGenres = [...genreByKey.values()];
  const normalizedGenres = new Set(genreByKey.keys());
  const genreOptions = [
    ...COMMON_GENRE_ORDER
      .filter((genre) => normalizedGenres.has(genre.toLocaleLowerCase()))
      .map((genre) => genreByKey.get(genre.toLocaleLowerCase())),
    ...availableGenres
      .filter((genre) => !COMMON_GENRE_ORDER.some(
        (commonGenre) => commonGenre.toLocaleLowerCase() === genre.toLocaleLowerCase(),
      ))
      .sort((a, b) => a.localeCompare(b)),
  ];
  const filteredSongs = selectedGenre === 'all'
    ? songs
    : songs.filter(
      (song) => getSongGenres(song.genre)
        .some((genre) => genre.toLocaleLowerCase() === selectedGenre.toLocaleLowerCase()),
    );
  const isLoading = activeResultType === 'songs' ? isLoadingSongs : isLoadingArtists;
  const searchError = activeResultType === 'songs' ? songError : artistError;
  const resultCount = activeResultType === 'songs' ? filteredSongs.length : artists.length;

  return (
    <main className="search-page">
      <section className="search-page__results" aria-label="Search">
        {query && (
          <div className="search-page__filters">
            <div className="search-page__result-types" role="group" aria-label="Search result type">
              <button
                className="search-page__filter-button"
                type="button"
                aria-pressed={activeResultType === 'songs'}
                onClick={() => setActiveResultType('songs')}
              >
                Songs
              </button>
              <button
                className="search-page__filter-button"
                type="button"
                aria-pressed={activeResultType === 'artists'}
                onClick={() => setActiveResultType('artists')}
              >
                Artists
              </button>
            </div>
            {activeResultType === 'songs' && songs.length > 0 && genreOptions.length > 0 && (
              <select
                id="search-genre"
                className="search-page__genre-select"
                aria-label="Filter songs by genre"
                value={selectedGenre}
                onChange={(event) => setSelectedGenre(event.target.value)}
              >
                <option value="all">All genres</option>
                {genreOptions.map((genre) => (
                  <option key={genre} value={genre}>{formatGenreLabel(genre)}</option>
                ))}
              </select>
            )}
          </div>
        )}
        {!query && <p className="home-empty">Enter a song title in the search bar to get started.</p>}
        {isLoading && (
          <p className="home-empty" role="status">
            Searching {activeResultType}…
          </p>
        )}
        {searchError && <p className="search-page__error" role="alert">{searchError}</p>}
        {!isLoading && !searchError && query && resultCount === 0 && (
          <p className="home-empty">
            {activeResultType === 'songs' ? 'No songs found.' : 'No artists found.'}
          </p>
        )}
        {!isLoading && !searchError && activeResultType === 'songs' && filteredSongs.length > 0 && (
          <ul className="album-songs search-page__song-list" aria-label="Song search results">
            {filteredSongs.map((song) => {
              const coverUrl = getGenreCover(song, selectedGenre)
                || song.albums?.cover_image_url;

              return (
                <li className="search-page__song" key={song.id}>
                  <div className="song-artwork album-cover search-page__artwork">
                    {coverUrl && <img src={coverUrl} alt="" />}
                  </div>
                  <span className="album-songs__title">{song.title}</span>
                  <span className="album-songs__artist">
                    {song.artist_name || 'Unknown artist'}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        {!isLoading && !searchError && activeResultType === 'artists' && artists.length > 0 && (
          <ul className="album-songs search-page__song-list" aria-label="Artist search results">
            {artists.map((artist) => (
              <li className="search-page__song" key={artist.id}>
                <div className="song-artwork album-cover search-page__artwork">
                  {artist.image_url && <img src={artist.image_url} alt="" />}
                </div>
                <span className="album-songs__title">{artist.name}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}