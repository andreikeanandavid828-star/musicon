import { useState } from 'react';
import './App.css';
import LightSwitch from './LightSwitch.jsx';
import Button from './Button.jsx';

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

    
      <h1>Musicon</h1>
      <p>Click below to get started:</p>
    </div>
  );
}

export default App;
