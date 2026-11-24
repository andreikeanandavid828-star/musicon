import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getGenreCover } from '../../gather_music/genreCovers.js';
import { getArtistProfileCover } from '../../gather_music/artistProfileCovers.js';

/**
 * Displays artist information and links to the artist's songs.
 *
 * @returns {React.JSX.Element} The artist detail page.
 */
export default function IndividualArtist() {
  const { artistId, artistName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const stateArtist = location.state?.artist;
  const [artist, setArtist] = useState(
    stateArtist && stateArtist.id === artistId ? stateArtist : null,
  );
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const artistKey = artistId ? `id:${artistId}` : `name:${artistName}`;

  useEffect(() => {
    const controller = new AbortController();
    setArtist(stateArtist && stateArtist.id === artistId ? stateArtist : null);
    setSongs([]);
    setIsLoading(true);
    setError('');

    async function fetchArtist() {
      try {
        const params = new URLSearchParams(
          artistId ? { id: artistId } : { name: artistName || '' },
        );
        const response = await fetch(
          `http://localhost:5000/api/search/artist?${params.toString()}`,
          { signal: controller.signal },
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Unable to load artist.');
        }

        setArtist(data.artist || null);
        setSongs(Array.isArray(data.songs) ? data.songs : []);
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setArtist(null);
          setSongs([]);
          setError(fetchError.message || 'Unable to load artist.');
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void fetchArtist();
    return () => controller.abort();
  }, [artistKey, artistId, artistName, stateArtist]);

  function handleBack() {
    navigate(location.state?.from ? -1 : '/search');
  }

  const profileCover = artist
    ? getArtistProfileCover(artist.name) || artist.image_url
    : null;

  return (
    <main className="individual-song-page individual-artist-page">
      <button
        className="individual-song__back"
        type="button"
        aria-label="Back"
        onClick={handleBack}
      >
        ←
      </button>
      {error && <p className="search-page__error" role="alert">{error}</p>}
      {isLoading && <p className="home-empty" role="status">Loading artist…</p>}
      {!isLoading && !error && artist && (
        <>
          <header className="individual-artist__header">
            {profileCover && (
              <img className="individual-artist__image" src={profileCover} alt="" />
            )}
            <h1>{artist.name}</h1>
          </header>
          <section aria-labelledby="individual-artist-songs-heading">
            <h2 id="individual-artist-songs-heading">Songs</h2>
            {songs.length === 0 ? (
              <p className="home-empty">No songs found for this artist.</p>
            ) : (
              <ul className="album-songs search-page__song-list" aria-label={`Songs by ${artist.name}`}>
                {songs.map((song) => {
                  const album = Array.isArray(song.albums) ? song.albums[0] : song.albums;
                  const coverUrl = getGenreCover(song) || album?.cover_image_url;

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
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
      {!isLoading && !error && !artist && (
        <p className="home-empty" role="status">Artist information is unavailable.</p>
      )}
    </main>
  );
}