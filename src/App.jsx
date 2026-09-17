import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import LightSwitch from './LightSwitch.jsx';
import FooterMusicPlayer from './Footer.jsx';
import Home from './Home.jsx';
import Login from './Login.jsx';

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

function AppShell() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`app-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="top-corner-container">
        <LightSwitch toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>

      <FooterMusicPlayer />
    </div>
  );
}

export default App;
