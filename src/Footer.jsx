import { useEffect, useRef, useState } from 'react';
import Button from './Button.jsx';

export default function FooterMusicPlayer({ selectedSong }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [playbackError, setPlaybackError] = useState('');
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
    <footer className="footer-panel" aria-label="Music player">
      <div className="footer-track">
        <span className="footer-eyebrow">Now playing</span>
        <strong>{selectedSong?.title ?? 'Select a song from Home'}</strong>
      </div>
      <Button
        className="footer-action"
        aria-label={isPlaying ? 'Pause' : 'Play'}
        title={isPlaying ? 'Pause' : 'Play'}
        disabled={!selectedSong}
        onClick={() => handlePlayPause()}
      >
        <span className={isPlaying ? 'pause-icon' : 'play-icon'} aria-hidden="true" />
      </Button>
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
