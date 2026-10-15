import { useEffect, useRef, useState } from 'react';
import jsmediatags from 'jsmediatags/dist/jsmediatags.min.js';
import Button from './Button.jsx';

export default function FooterMusicPlayer({ selectedSong, onPreviousSong, onNextSong }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [playbackError, setPlaybackError] = useState('');
  const [artworkUrl, setArtworkUrl] = useState(null);
  const audioRef = useRef(null);
  const artworkUrlRef = useRef(null);

  useEffect(() => {
    let isCurrentTrack = true;

    if (artworkUrlRef.current) {
      URL.revokeObjectURL(artworkUrlRef.current);
      artworkUrlRef.current = null;
    }
    setArtworkUrl(null);

    if (!selectedSong?.src) {
      return () => { isCurrentTrack = false; };
    }

    const trackUrl = new URL(selectedSong.src, window.location.href).href;
    jsmediatags.read(trackUrl, {
      onSuccess: ({ tags }) => {
        const picture = tags.picture;
        if (!isCurrentTrack || !picture?.data?.length) return;

        const image = new Blob([new Uint8Array(picture.data)], {
          type: picture.format || 'image/jpeg',
        });
        const nextArtworkUrl = URL.createObjectURL(image);
        artworkUrlRef.current = nextArtworkUrl;
        setArtworkUrl(nextArtworkUrl);
      },
      onError: () => {
        if (isCurrentTrack) setArtworkUrl(null);
      },
    });

    return () => {
      isCurrentTrack = false;
      if (artworkUrlRef.current) {
        URL.revokeObjectURL(artworkUrlRef.current);
        artworkUrlRef.current = null;
      }
    };
  }, [selectedSong]);

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
    <footer className="footer-panel" aria-label="Music player">
      <div className="footer-track">
        <div className="footer-artwork" aria-hidden={!artworkUrl}>
          {artworkUrl && <img src={artworkUrl} alt="" />}
        </div>
        <div className="footer-track__text">
          <span className="footer-eyebrow">Now playing</span>
          <strong>{selectedSong?.title ?? 'Select a song from Home'}</strong>
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
  );
}
