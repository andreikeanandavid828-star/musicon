
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

/**
 * Displays another user's public profile.
 * Editing and account-specific controls are intentionally excluded.
 */
export default function ProfileViewer() {
  const { userId } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      setLoading(true);
      setError('');
      setProfile(null);
      setActiveTab('Overview');

      try {
        const response = await fetch(
          `http://localhost:5000/profile/users/${encodeURIComponent(userId)}`,
          { signal: controller.signal }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || 'Could not load profile.');
        }

        if (!data.profile) {
          throw new Error('Profile information is unavailable.');
        }

        if (!controller.signal.aborted) {
          setProfile(data.profile);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message || 'Could not load profile.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => controller.abort();
  }, [userId]);

  if (loading) {
    return (
      <main className="profile-page">
        <p role="status">Loading profile...</p>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="profile-page">
        <h1>Profile unavailable</h1>
        <p role="alert">{error || 'Profile not found.'}</p>
        <Link to="/">Return home</Link>
      </main>
    );
  }

  const tabs = ['Overview', 'Ratings', 'Tier Lists', 'Posts', 'Playlists'];

  if (profile.isArtist) {
    tabs.push('Music');
  }

  const stats = [
    ['Followers', profile.followers],
    ['Following', profile.following],
    ['Friends', profile.friends],
    ['Ratings', profile.ratings],
    ['Tier Lists', profile.tierLists],
    ['Posts', profile.posts],
  ];

  const sectionDescriptions = {
    Overview: 'Public activity will appear here in a future update.',
    Ratings: 'Public music ratings are not connected yet.',
    'Tier Lists': 'Public tier lists are not connected yet.',
    Posts: 'This user’s forum posts are not connected to this view yet.',
    Playlists: 'Public playlists are not connected yet.',
    Music: 'Uploaded music will appear here in a future update.',
  };

  return (
    <main className="profile-page">
      <section className="profile-hero">
        <div className="profile-banner">
          {profile.bannerPicture && (
            <img src={profile.bannerPicture} alt="" />
          )}
        </div>

        <div className="profile-avatar">
          {profile.profilePicture ? (
            <img
              src={profile.profilePicture}
              alt={`${profile.username}'s profile`}
            />
          ) : (
            <span>
              {profile.username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="profile-identity">
          <h1 className="profile-username">
            {profile.username}
          </h1>

          {profile.isArtist && (
            <span className="artist-badge">
              Verified Artist
            </span>
          )}

          {profile.location && (
            <p className="profile-location-display">
              <span aria-hidden="true">📍</span> {profile.location}
            </p>
          )}

          <p className="profile-bio">{profile.bio}</p>
        </div>

        <section className="profile-stats">
          {stats.map(([label, value]) => (
            <div className="profile-stat" key={label}>
              <strong>{value ?? 0}</strong>
              <span>{label}</span>
            </div>
          ))}
        </section>
      </section>

      <nav className="profile-tabs" aria-label="Profile sections">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={
              activeTab === tab
                ? 'profile-tab profile-tab--active'
                : 'profile-tab'
            }
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <section className="profile-content">
        <div className="profile-section">
          <h2>{activeTab === 'Music' ? 'Uploaded Music' : activeTab}</h2>
          <p>{sectionDescriptions[activeTab]}</p>
        </div>
      </section>
    </main>
  );
}
