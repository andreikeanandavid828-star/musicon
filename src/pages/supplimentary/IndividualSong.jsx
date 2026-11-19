import { useLocation, useNavigate, useParams } from 'react-router-dom';
import SongArtwork from '../../gather_music/SongArtwork.jsx';
import { getGenreCover } from '../../gather_music/genreCovers.js';

/**
 * Displays database song details for a selected search result.
 *
 * @param {Object} props - Optional song data for rendering this page directly.
 * @param {Object|null} [props.song] - Song record matching the search API shape.
 * @returns {React.JSX.Element} The song detail page.
 */
export default function IndividualSong({ song: providedSong = null }) {
  const { songId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const stateSong = location.state?.song;
  const song = providedSong || (stateSong?.id === songId ? stateSong : null);
  const album = Array.isArray(song?.albums) ? song.albums[0] : song?.albums;
  const searchCoverUrl = stateSong?.id === songId ? location.state?.coverUrl : null;
  const coverUrl = searchCoverUrl || getGenreCover(song) || album?.cover_image_url;

  function handleBack() {
    const previousPage = location.state?.from;
    navigate(previousPage || '/search');
  }

  return (
    <main className="individual-song-page">
      <button
        className="individual-song__back"
        type="button"
        aria-label="Back"
        onClick={handleBack}
      >
        ←
      </button>
      {!song ? (
        <p className="home-empty" role="status">Song information is unavailable.</p>
      ) : (
        <article className="individual-song">
          {coverUrl && (
            <img
              className="individual-song__cover"
              src={coverUrl}
              alt=""
            />
          )}
          {!coverUrl && (
            <SongArtwork
              song={song}
              className="individual-song__artwork"
            />
          )}
          <div className="individual-song__details">
            <p className="individual-song__eyebrow">Song</p>
            <h1>{song.title || 'Untitled song'}</h1>
            <p className="individual-song__artist">
              {song.artist_name || 'Unknown artist'}
            </p>
            <dl className="individual-song__metadata">
              {album?.title && (
                <div>
                  <dt>Album</dt>
                  <dd>{album.title}</dd>
                </div>
              )}
            </dl>
          </div>
        </article>
      )}
    </main>
  );
}