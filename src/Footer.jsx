import { useState } from 'react';

function FooterMusicPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <footer className="footer-panel" aria-label="Music player">
            <div className="footer-track">
                <span className="footer-eyebrow">Now playing</span>
                <strong>Choose a track to begin</strong>
            </div>
            <button
                className="footer-action"
                type="button"
                aria-label={isPlaying ? 'Pause' : 'Play'}
                title={isPlaying ? 'Pause' : 'Play'}
                onClick={() => setIsPlaying(!isPlaying)}
            >
                <span className={isPlaying ? 'pause-icon' : 'play-icon'} aria-hidden="true" />
            </button>
            <input className="footer-volume" type="range" min="0" max="100" defaultValue="50" />
        </footer>
    );
}

export default FooterMusicPlayer;
