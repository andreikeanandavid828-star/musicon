import { useRef, useState } from 'react';
import Button from './Button.jsx';
import track from './assets/TempMusic/Neon Dawn Fade (4).mp3';

export default function FooterMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const handlePlayPause = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      await audioRef.current.play();
      setIsPlaying(true);
    }
  };

  
  return (
    <footer className="footer-panel" aria-label="Music player">
      <div className="footer-track">
        <span className="footer-eyebrow">Now playing</span>
        <strong>Choose a track to begin</strong>
      </div>
      <Button
        className="footer-action"
        aria-label={isPlaying ? 'Pause' : 'Play'}
        title={isPlaying ? 'Pause' : 'Play'}
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
        defaultValue="0.5"
        aria-label="Volume"
        onChange={(event) => {
          if (audioRef.current) audioRef.current.volume = event.target.value;
        }}
      />
      <audio
        ref={audioRef}
        src={track}
        volume={0.5}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />
    </footer>
  );
}
