import { useState } from 'react';
import './App.css';
import LightSwitch from './LightSwitch.jsx';
import Button from './Button.jsx';
import FooterMusicPlayer from './Footer.jsx';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

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

      <FooterMusicPlayer />
    </div>
  );
}

export default App;
