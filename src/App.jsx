import { useCallback, useEffect, useState } from 'react';
import HomeButton from './home_buttons/side-bar_buttons/HomeButton.jsx';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './css/App.css';
import FooterMusicPlayer from './Footer.jsx';
import Home from './pages/Home.jsx';
import LightSwitch from './home_buttons/side-bar_buttons/LightSwitch.jsx';
import Login from './pages/supplimentary/Login.jsx';
import LoginButton from './home_buttons/LoginButton.jsx';
import SignUp from './pages/supplimentary/SignUp.jsx';
import Tierlist from './pages/main_content/TierList.jsx';
import TierlistButton from './home_buttons/side-bar_buttons/TierListButton.jsx';
import Forum from './pages/main_content/Forum.jsx';
import ForumButton from './home_buttons/side-bar_buttons/ForumButton.jsx';
import SignupButton from './home_buttons/SignupButton.jsx';
import Profile from './pages/supplimentary/profile/Profile.jsx';
import ProfileButton from './home_buttons/ProfileButton.jsx';
import Albums from './pages/main_content/Albums.jsx';
import AlbumButton from './home_buttons/side-bar_buttons/AlbumButton.jsx';
import Upload from './pages/supplimentary/Upload.jsx';
import Search from './pages/main_content/Search.jsx';
import SearchBar from './home_buttons/SearchBar.jsx';
import { songs } from './gather_music/songs.jsx';
import Button from './Button.jsx';
import { DEFAULT_PALETTE, readPalette, readDefaultMode, savePalette, saveDefaultMode } from './pages/supplimentary/profile/Appearance.js';

/**
 * @fileoverview Defines the top-level application shell, shared music and
 * appearance state, session handling, and client-side routes.
 * @module App
 * @author Mariam, Ian, Anthony
 * @date 2026-11-09
 */

/**
 * @typedef {Object} Song
 * @property {string} id - Unique song identifier.
 * @property {string} title - Display title.
 * @property {string} [src] - Audio source, when the song has one.
 * @property {string} [artist] - Artist name, when provided.
 *
 * @typedef {Object} Album
 * @property {string} id - Unique album identifier.
 * @property {string} name - Album display name.
 * @property {string[]} songIds - IDs of songs in playback order.
 *
 * @typedef {'checking' | 'guest' | 'authenticated' | 'error'} AuthStatus
 * @typedef {'light' | 'dark'} AppearanceMode
 */

/**
 * Owns state shared across routes and renders the application header,
 * navigation, route content, and music player.
 *
 * Important state structures are the combined song catalog (`Song[]`), the
 * in-memory album list (`Album[]`), and the authentication status, which
 * controls guest/authenticated appearance and navigation.
 *
 * @returns {React.JSX.Element} The routed application shell.
 */
function AppShell() {
  // Color family and preferred brightness are independent settings.
  // only logged in users can get customized color families and brightness preferences. Guests always see Original Musicon / Light.
  const [paletteId, setPaletteId] = useState(readPalette);
  const [defaultMode, setDefaultMode] = useState(readDefaultMode);
  const [isDarkMode, setIsDarkMode] = useState(true);

  /**
   * Saves the selected palette and updates the current session's palette.
   * @param {string} id - ID of the palette to apply.
   * @returns {void}
   */
  function changePalette(id) {
    savePalette(id);
    setPaletteId(id);
  }

  /**
   * Saves the preferred brightness mode and applies it immediately.
   * @param {AppearanceMode} mode - Brightness mode to use by default.
   * @returns {void}
   */
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

  /**
   * Checks the current backend session and updates authentication state.
   * Authenticated users restore their saved appearance; guests use the guest
   * defaults. Network or unexpected HTTP failures are surfaced in the UI.
   *
   * @returns {Promise<void>} Resolves after the session check and state updates.
   */
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

  /**
   * Marks the user authenticated after a successful login and restores saved
   * appearance preferences.
   * @returns {void}
   */
  function handleLoggedIn() {
    setAuthError('');
    // Restore previous browser preferences; login itself doesn't change them.
    setPaletteId(readPalette());
    setDefaultMode(readDefaultMode());
    setIsDarkMode(readDefaultMode() === 'dark');
    setAuthStatus('authenticated');
  }

  /**
   * Logs out through the backend, switches to guest appearance, and navigates
   * home. On failure, keeps the current session state and displays an error.
   * @returns {Promise<void>} Resolves after logout handling completes.
   */
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
  /**
   * Adds a newly created album to the in-memory album list.
   * @param {Album} album - Album record to add.
   * @returns {void}
   */
  const handleCreateAlbum = (album) => {
    setAlbums((currentAlbums) => [...currentAlbums, album]);
  };
  /**
   * Appends song IDs to the selected album without changing other albums.
   * @param {string} albumId - ID of the album to update.
   * @param {string[]} songIds - Song IDs to append in the supplied order.
   * @returns {void}
   */
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
  /**
   * Selects a song for playback outside a specific album context.
   * @param {Song} song - Song to play.
   * @returns {void}
   */
  const handleSongSelection = (song) => {
    setActiveAlbumId(null);
    setSelectedSong({ ...song });
  };
  /**
   * Selects a song for playback while retaining its album context.
   * @param {Song} song - Song to play.
   * @param {string} albumId - ID of the album being played.
   * @returns {void}
   */
  const handleAlbumSongSelection = (song, albumId) => {
    setActiveAlbumId(albumId);
    setSelectedSong({ ...song });
  };
  /**
   * Moves to the previous or next song, wrapping at either end of the list.
   * Uses the active album's ordered song IDs when an album is selected;
   * otherwise uses the full available catalog. Wrapping uses modulo arithmetic
   * so playback can continue in either direction without a separate boundary
   * case for each end of the list.
   *
   * @param {number} direction - `-1` for the previous song or `1` for next.
   * @returns {void}
   */
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
            <SearchBar />
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
        <Route path="/search" element={<Search />} />
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

/**
 * Wraps the application shell in React Router so its routes and navigation
 * hooks share one browser-history context.
 *
 * @returns {React.JSX.Element} The routed Musicon application.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}