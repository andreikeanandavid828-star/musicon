import { useEffect, useState } from 'react';
import HomeButton from './HomeButton.jsx';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import FooterMusicPlayer from './Footer.jsx';
import Home from './Home.jsx';
import LightSwitch from './LightSwitch.jsx';
import Login from './Login.jsx';
import LoginButton from './LoginButton.jsx';
import SignUp from './SignUp.jsx';
import Tierlist from './TierList.jsx';
import TierlistButton from './TierListButton.jsx';
import Forum from './Forum.jsx';
import ForumButton from './ForumButton.jsx';

function AppShell() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { pathname } = useLocation();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light';
    return () => { delete document.documentElement.dataset.theme; };
  }, [isDarkMode]);

  return (
    <div className="app-container">
      <header className={isAuthPage ? 'app-header app-header--login' : 'app-header'}>
        {!isAuthPage && <LoginButton />}
        <LightSwitch
          isDarkMode={isDarkMode}
          toggleTheme={() => setIsDarkMode((current) => !current)}
        />
      </header>

      <aside className="app-sidebar" aria-label="Main menu">
        <HomeButton />
        <hr className="app-sidebar__divider" />
        <TierlistButton />
        <ForumButton />
      </aside>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/tierlist" element={<Tierlist />} />
        <Route path="/forum" element={<Forum />} />
      </Routes>

      {!isAuthPage && <FooterMusicPlayer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}