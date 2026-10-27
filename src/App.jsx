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
import Albums from './Albums.jsx';
import AlbumButton from './AlbumButton.jsx';
import Upload from './Upload.jsx';
import { songs } from './songs.jsx';
import Button from './Button.jsx';
import { DEFAULT_PALETTE, readPalette, readDefaultMode, savePalette, saveDefaultMode } from './Appearance.js';

function AppShell() {
  // Color family and preferred brightness are independent settings.
  // only logged in users can get customized color families and brightness preferences. Guests always see Original Musicon / Light.
  const [paletteId, setPaletteId] = useState(readPalette);
  const [defaultMode, setDefaultMode] = useState(readDefaultMode);
  const [isDarkMode, setIsDarkMode] = useState(true);

  function changePalette(id) {
    savePalette(id);
    setPaletteId(id);
  }

  function changeDefaultMode(mode) {
    saveDefaultMode(mode);
    setDefaultMode(mode);
    setIsDarkMode(mode === 'dark');
  }
  const [selectedSong, setSelectedSong] = useState(null);
  const [activeAlbumId, setActiveAlbumId] = useState(null);
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
        // Don't erase the saved preference: guests simply see Original Musicon.
        setIsDarkMode(true);
        setAuthStatus('guest');
      } else if (response.ok || response.status === 404) {
        // Restore the saved brightness once the existing session is confirmed.
        setIsDarkMode(readDefaultMode() === 'dark');
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
    // Restore previous browser preferences; login itself doesn't change them.
    setPaletteId(readPalette());
    setDefaultMode(readDefaultMode());
    setIsDarkMode(readDefaultMode() === 'dark');
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
      // Show the guest site in Original Musicon / Light without deleting preferences.
      setIsDarkMode(true);
      setAuthStatus('guest');
      navigate('/');
    } catch {
      setAuthError('Could not log out. Please try again.');
    }
  }

  const [userSongs, setUserSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const availableSongs = [...songs, ...userSongs];
  const handleCreateAlbum = (album) => {
    setAlbums((currentAlbums) => [...currentAlbums, album]);
  };
  const handleAddSongs = (albumId, songIds) => {
    setAlbums((currentAlbums) =>
      currentAlbums.map((album) =>
        album.id === albumId
          ? { ...album, songIds: [...album.songIds, ...songIds] }
          : album,
      ),
    );
  };
  const { pathname } = useLocation();
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const handleSongSelection = (song) => {
    setActiveAlbumId(null);
    setSelectedSong({ ...song });
  };
  const handleAlbumSongSelection = (song, albumId) => {
    setActiveAlbumId(albumId);
    setSelectedSong({ ...song });
  };
  const handleTrackNavigation = (direction) => {
    const activeAlbum = albums.find((album) => album.id === activeAlbumId);
    const trackList = activeAlbum
      ? activeAlbum.songIds
        .map((songId) => availableSongs.find((song) => song.id === songId))
        .filter(Boolean)
      : availableSongs;

    if (trackList.length === 0) return;

    const currentIndex = trackList.findIndex((song) => song.id === selectedSong?.id);
    const nextIndex = currentIndex === -1
      ? (direction < 0 ? trackList.length - 1 : 0)
      : (currentIndex + direction + trackList.length) % trackList.length;

    setSelectedSong({ ...trackList[nextIndex] });
  };

  useEffect(() => {
    const root = document.documentElement;
    // Guest pages always use the original color family. Only authenticated
    // users see their saved palette; checking/error states use original light.
    root.dataset.palette = authStatus === 'authenticated' ? paletteId : DEFAULT_PALETTE;
    root.dataset.theme = (authStatus === 'checking' || authStatus === 'error')
      ? 'dark'
      : (isDarkMode ? 'dark' : 'light');
  }, [authStatus, isDarkMode, paletteId]);

  return (
    <div className="app-container">
      <header className="app-header">
        {!isAuthPage && (
          <>
            {authStatus === 'guest' && (
              <><LoginButton /><SignupButton /></>
            )}
            {authStatus === 'authenticated' && (
              <ProfileButton onLogout={handleLogout} />
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
        <AlbumButton />
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
              songs={availableSongs}
              albums={albums}
              selectedSong={selectedSong}
              onSelectSong={handleSongSelection}
            />
          }
        />
        <Route path="/login" element={<Login onLoggedIn={handleLoggedIn} />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/tierlist" element={<Tierlist />} />
        <Route path="/forum" element={<Forum />} />
        <Route
          path="/albums"
          element={
            <Albums
              albums={albums}
              songs={availableSongs}
              onCreateAlbum={handleCreateAlbum}
              onAddSongs={handleAddSongs}
              selectedSong={selectedSong}
              onSelectSong={handleAlbumSongSelection}
            />
          }
        />
        <Route
          path="/albums/:albumId"
          element={
            <Albums
              albums={albums}
              songs={availableSongs}
              onCreateAlbum={handleCreateAlbum}
              onAddSongs={handleAddSongs}
              selectedSong={selectedSong}
              onSelectSong={handleAlbumSongSelection}
            />
          }
        />
        <Route
          path="/profile"
          element={
            <Profile
              paletteId={paletteId}
              defaultMode={defaultMode}
              currentMode={isDarkMode ? 'dark' : 'light'}
              onPaletteChange={changePalette}
              onDefaultModeChange={changeDefaultMode}
            />
          }
        />
        <Route
          path="/upload"
          element={
            <Upload
              onPostSong={(song) => setUserSongs((currentSongs) => [...currentSongs, song])}
            />
          }
        />
      </Routes>

      {!isAuthPage && (
        <FooterMusicPlayer
          selectedSong={selectedSong}
          onPreviousSong={() => handleTrackNavigation(-1)}
          onNextSong={() => handleTrackNavigation(1)}
          onSongEnded={() => handleTrackNavigation(1)}
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