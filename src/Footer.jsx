import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button.jsx';
import SongArtwork from './SongArtwork.jsx';

export default function FooterMusicPlayer({ selectedSong, onPreviousSong, onNextSong }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [playbackError, setPlaybackError] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !selectedSong) return undefined;

    setPlaybackError('');
    audio.currentTime = 0;
    audio.play().catch((error) => {
      setIsPlaying(false);
      setPlaybackError('Playback could not start. Press Play to try again.');
      console.error('Unable to play the selected song.', error);
    });

    return () => audio.pause();
  }, [selectedSong]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || !selectedSong) return;

    setPlaybackError('');
    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
    } catch (error) {
      setIsPlaying(false);
      setPlaybackError('Playback could not start. Please try again.');
      console.error('Unable to play the selected song.', error);
    }
  };


  return (
    <div className="footer-player-shell">
      <Button
        className="footer-collapse-toggle"
        aria-label={isCollapsed ? 'Show music player' : 'Hide music player'}
        aria-expanded={!isCollapsed}
        aria-controls="footer-music-player"
        title={isCollapsed ? 'Show music player' : 'Hide music player'}
        onClick={() => setIsCollapsed((collapsed) => !collapsed)}
      >
        <span aria-hidden="true">{isCollapsed ? '^' : 'V'}</span>
      </Button>
      <footer
        id="footer-music-player"
        className={`footer-panel${isCollapsed ? ' footer-panel--collapsed' : ''}`}
        aria-label="Music player"
        aria-hidden={isCollapsed}
        inert={isCollapsed}
      >
        <div className="footer-track">
          <SongArtwork song={selectedSong} className="footer-artwork" />
          <div className="footer-track__text">
            <span className="footer-eyebrow">Now playing</span>
            {selectedSong ? (
              <strong>{selectedSong.title}</strong>
            ) : (
              <Link className="footer-empty-link" to="/">
                <strong>Select a song from Home</strong>
              </Link>
            )}
          </div>
        </div>
        <div className="footer-controls" role="group" aria-label="Playback controls">
          <Button
            className="footer-action"
            aria-label="Previous track"
            title="Previous track"
            onClick={onPreviousSong}
          >
            <span className="skip-icon skip-icon--previous" aria-hidden="true">
              <span />
              <span />
            </span>
          </Button>
          <Button
            className="footer-action"
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title={isPlaying ? 'Pause' : 'Play'}
            disabled={!selectedSong}
            onClick={() => handlePlayPause()}
          >
            <span className={isPlaying ? 'pause-icon' : 'play-icon'} aria-hidden="true" />
          </Button>
          <Button
            className="footer-action"
            aria-label="Next track"
            title="Next track"
            onClick={onNextSong}
          >
            <span className="skip-icon skip-icon--next" aria-hidden="true">
              <span />
              <span />
            </span>
          </Button>
        </div>

        <input
          className="footer-volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          aria-label="Volume"
          style={{ '--volume-fill': `${volume * 100}%` }}
          onChange={(event) => setVolume(Number(event.target.value))}
        />

        <audio
          ref={audioRef}
          src={selectedSong?.src}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          preload="metadata"
        />
        {playbackError && (
          <span className="footer-error" role="status">
            {playbackError}
          </span>
        )}
      </footer>
    </div>
  );
}
