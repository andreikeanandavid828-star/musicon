import { useState } from 'react';
import Button from './Button.jsx';

export default function FooterMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);

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
        onClick={() => setIsPlaying((current) => !current)}
      >
        <span className={isPlaying ? 'pause-icon' : 'play-icon'} aria-hidden="true" />
      </Button>
      <input className="footer-volume" type="range" min="0" max="100" defaultValue="50" aria-label="Volume" />
    </footer>
  );
}
