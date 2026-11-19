import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getGenreCover } from '../../gather_music/genreCovers.js';

const COMMON_GENRE_ORDER = ['Pop', 'R&B', 'Hip Hop', 'Dance/Electronic', 'Rock'];

function getSongGenres(genre) {
  const values = Array.isArray(genre) ? genre : [genre];
  return values
    .flatMap((value) => typeof value === 'string' ? value.split(/[,;|\n]+/) : [])
    .map((value) => value.trim())
    .filter(Boolean);
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
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q')?.trim() || '';
  const requestedPage = Number(searchParams.get('page'));
  const currentPage = Number.isInteger(requestedPage) && requestedPage > 0
    ? requestedPage
    : 1;

  useEffect(() => {
    setSelectedGenre('all');
    setActiveResultType('songs');
  }, [query]);

  useEffect(() => {
    if (!query) {
      setSongs([]);
      setSongError('');
      setIsLoadingSongs(false);
      setHasNextPage(false);
      setTotalPages(0);
      return undefined;
    }

    const controller = new AbortController();
    setSongs([]);
    setIsLoadingSongs(true);
    setSongError('');
    setHasNextPage(false);
    setTotalPages(0);

    async function fetchSongs() {
      try {
        const params = new URLSearchParams({
          q: query,
          page: String(currentPage),
        });
        const response = await fetch(
          `http://localhost:5000/api/search/songs?${params.toString()}`,
          { signal: controller.signal },
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Unable to search songs.');
        }

        setSongs(Array.isArray(data.songs) ? data.songs.slice(0, 20) : []);
        setTotalPages(Number.isInteger(data.total_pages) ? data.total_pages : 0);
        setHasNextPage(
          typeof data.has_next === 'boolean'
            ? data.has_next
            : Number(data.total_pages) > currentPage,
        );
      } catch (error) {
        if (error.name !== 'AbortError') {
          setSongs([]);
          setSongError(error.message || 'Unable to search songs.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingSongs(false);
        }
      }
    }

    void fetchSongs();
    return () => controller.abort();
  }, [query, currentPage]);

  useEffect(() => {
    if (!query) {
      setArtists([]);
      setArtistError('');
      setIsLoadingArtists(false);
      return undefined;
    }

    const controller = new AbortController();
    setArtists([]);
    setIsLoadingArtists(true);
    setArtistError('');

    async function fetchArtists() {
      try {
        const params = new URLSearchParams({ q: query, page: '1' });
        const response = await fetch(
          `http://localhost:5000/api/search/artists?${params.toString()}`,
          { signal: controller.signal },
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Unable to search artists.');
        }

        setArtists(Array.isArray(data.artists) ? data.artists.slice(0, 20) : []);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setArtists([]);
          setArtistError(error.message || 'Unable to search artists.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingArtists(false);
        }
      }
    }

    void fetchArtists();
    return () => controller.abort();
  }, [query]);

  function navigateToPage(page) {
    const params = new URLSearchParams(location.search);
    params.set('q', query);
    params.set('page', String(page));
    setActiveResultType('songs');
    navigate({ pathname: location.pathname, search: `?${params.toString()}` });
  }

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

  function renderPagination(position) {
    if (!query || activeResultType !== 'songs') return null;

    return (
      <nav className={`search-page__pagination search-page__pagination--${position}`} aria-label={`${position} search pagination`}>
        <button
          className="search-page__pagination-button"
          type="button"
          disabled={currentPage <= 1 || isLoadingSongs}
          onClick={() => navigateToPage(currentPage - 1)}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <button
            className="search-page__pagination-button search-page__pagination-number"
            type="button"
            key={page}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
            disabled={isLoadingSongs || page === currentPage}
            onClick={() => navigateToPage(page)}
          >
            {page}
          </button>
        ))}
        <button
          className="search-page__pagination-button"
          type="button"
          disabled={!hasNextPage || isLoadingSongs}
          onClick={() => navigateToPage(currentPage + 1)}
        >
          Next
        </button>
      </nav>
    );
  }

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
        {renderPagination('top')}
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
                  <Link
                    className="search-page__song-link"
                    to={`/songs/${encodeURIComponent(song.id)}`}
                    state={{
                      song,
                      coverUrl,
                      from: `${location.pathname}${location.search}`,
                    }}
                  >
                    <div className="song-artwork album-cover search-page__artwork">
                      {coverUrl && <img src={coverUrl} alt="" />}
                    </div>
                    <span className="album-songs__title">{song.title}</span>
                    <span className="album-songs__artist">
                      {song.artist_name || 'Unknown artist'}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        {renderPagination('bottom')}
        {!isLoading && !searchError && activeResultType === 'artists' && artists.length > 0 && (
          <ul className="album-songs search-page__song-list" aria-label="Artist search results">
            {artists.map((artist) => (
              <li className="search-page__song" key={artist.id}>
                <Link
                  className="search-page__song-link"
                  to={`/artists/${encodeURIComponent(artist.id)}`}
                  state={{
                    artist,
                    from: `${location.pathname}${location.search}`,
                  }}
                >
                  <div className="song-artwork album-cover search-page__artwork">
                    {artist.image_url && <img src={artist.image_url} alt="" />}
                  </div>
                  <span className="album-songs__title">{artist.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}