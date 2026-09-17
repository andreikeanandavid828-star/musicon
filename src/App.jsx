import { useState } from 'react';
import './App.css';
import LightSwitch from './LightSwitch.jsx';
import Button from './Button.jsx';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  return (
    <div className={`app-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="top-corner-container">
        <LightSwitch toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      </div>
      <div className="left-top-corner-container">
        <Button />
      </div>

      <h1>Musicon</h1>
      <p>Click below to get started:</p>

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
    </div>
  );
}

export default App;
