
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function ProfileButton({ onLogout }) {
  const [profile, setProfile] = useState(null);
  const [open, setOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const navigate = useNavigate();

  // Retrieve the logged-in user's profile information.
  const refreshProfile = useCallback(async () => {
    try {
      const response = await fetch(
        'http://localhost:5000/profile/me',
        { credentials: 'include' }
      );

      if (!response.ok) return;

      const data = await response.json();

      if (data.profile) {
        setProfile(data.profile);
      }
    } catch {
      // The menu remains usable even without profile data.
    }
  }, []);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    setImageFailed(false);
  }, [profile?.profilePicture]);

  // Close the dropdown when clicking outside or pressing Escape.
  useEffect(() => {
    if (!open) return undefined;

    function handlePointer(event) {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKey(event) {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const username = profile?.username || 'Account';
  const initial = username.charAt(0).toUpperCase();

  function toggleMenu() {
    if (!open) void refreshProfile();
    setOpen((current) => !current);
  }

  function openPersonalize() {
    setOpen(false);
    navigate('/profile', {
      state: { openPersonalize: true },
    });
  }

  return (
    <div className="account-menu" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className="account-menu__trigger"
        aria-expanded={open}
        aria-controls={open ? 'account-menu-options' : undefined}
        onClick={toggleMenu}
      >
        <span className="account-menu__avatar" aria-hidden="true">
          {profile?.profilePicture && !imageFailed ? (
            <img
              src={profile.profilePicture}
              alt=""
              onError={() => setImageFailed(true)}
            />
          ) : (
            initial
          )}
        </span>

        <span className="account-menu__username">
          {username}
        </span>

        <span aria-hidden="true">▾</span>
      </button>

      {open && (
        <nav
          id="account-menu-options"
          className="account-menu__list"
          aria-label="Account options"
        >
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
          >
            My Profile
          </Link>

          <button
            type="button"
            onClick={openPersonalize}
          >
            Personalize
          </button>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              void onLogout();
            }}
          >
            Log out
          </button>
        </nav>
      )}
    </div>
  );
}
