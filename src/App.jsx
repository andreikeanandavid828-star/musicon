import { useCallback, useEffect, useState } from 'react';
import HomeButton from './HomeButton.jsx';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
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
import SignupButton from './SignupButton.jsx';
import Profile from './Profile.jsx';
import ProfileButton from './ProfileButton.jsx';
import Upload from './Upload.jsx';
import UploadButton from './UploadButton.jsx';
import { songs } from './songs.jsx';
import Button from './Button.jsx';

function AppShell() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  // Treat the backend's HttpOnly cookie as the source of truth.
  const [authStatus, setAuthStatus] = useState('checking');
  const [authError, setAuthError] = useState('');
  const navigate = useNavigate();

  // GET /profile/me authenticates via utility.get_authenticated_user().
  // Its 404 responses occur after authentication, when a DB row is missing.
  // In the long term, a dedicated GET /api/auth/me endpoint would be cleaner.
  const verifySession = useCallback(async () => {
    setAuthStatus('checking');
    setAuthError('');
    try {
      const response = await fetch('http://localhost:5000/profile/me', {
        credentials: 'include',
      });
      if (response.status === 401) {
        setAuthStatus('guest');
      } else if (response.ok || response.status === 404) {
        setAuthStatus('authenticated');
      } else {
        setAuthStatus('error');
        setAuthError('Unable to check your session.');
      }
    } catch {
      setAuthStatus('error');
      setAuthError('Unable to contact the server.');
    }
  }, []);

  useEffect(() => { void verifySession(); }, [verifySession]);

  function handleLoggedIn() {
    setAuthError('');
    setAuthStatus('authenticated');
  }

  async function handleLogout() {
    setAuthError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Logout failed');
      setAuthStatus('guest');
      navigate('/');
    } catch {
      setAuthError('Could not log out. Please try again.');
    }
  }

  const { pathname } = useLocation();
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const handleSongSelection = (song) => setSelectedSong({ ...song });
  const handleTrackNavigation = (direction) => {
    const currentIndex = songs.findIndex((song) => song.id === selectedSong?.id);
    const nextIndex = currentIndex === -1
      ? direction < 0 ? songs.length - 1 : 0
      : (currentIndex + direction + songs.length) % songs.length;

    handleSongSelection(songs[nextIndex]);
  };

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light';
    return () => { delete document.documentElement.dataset.theme; };
  }, [isDarkMode]);

  return (
    <div className="app-container">
      <header className="app-header">
        {!isAuthPage && (
          <>
            {authStatus === 'guest' && (
              <><LoginButton /><SignupButton /></>
            )}
            {authStatus === 'authenticated' && (
              <>
                <ProfileButton />
                <Button onClick={handleLogout}>Log out</Button>
              </>
            )}
            {authStatus === 'checking' && <span role="status">Checking session…</span>}
            {authStatus === 'error' && (
              <>
                <LoginButton />
                <SignupButton />
                <Button onClick={() => void verifySession()}>Retry session check</Button>
              </>
            )}
            {authError && <span role="alert">{authError}</span>}
          </>
        )}
      </header>

      <aside className="app-sidebar" aria-label="Main menu">
        <HomeButton />
        <hr className="app-sidebar__divider" />
        <TierlistButton />
        <ForumButton />
        <UploadButton />
        <LightSwitch
          isDarkMode={isDarkMode}
          toggleTheme={() => setIsDarkMode((current) => !current)}
        />
      </aside>

      <Routes>
        <Route
          path="/"
          element={
            <Home
              selectedSong={selectedSong}
              onSelectSong={handleSongSelection}
            />
          }
        />
        <Route path="/login" element={<Login onLoggedIn={handleLoggedIn} />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/tierlist" element={<Tierlist />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>

      {!isAuthPage && (
        <FooterMusicPlayer
          selectedSong={selectedSong}
          onPreviousSong={() => handleTrackNavigation(-1)}
          onNextSong={() => handleTrackNavigation(1)}
        />
      )}
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