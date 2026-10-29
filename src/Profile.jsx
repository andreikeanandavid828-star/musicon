import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from './Button.jsx';
import PersonalizeModal from './PersonalizeModal.jsx';
function CropEditor({ source, type, onApply, onCancel }) {
  const viewportRef = useRef(null);
  const imageRef = useRef(null);
  const dragRef = useRef(null);

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);

  const isAvatar = type === 'avatar';

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return undefined;
    }

    const updateViewportSize = () => {
      const rect = viewport.getBoundingClientRect();

      setViewportSize({
        width: rect.width,
        height: rect.height,
      });
    };

    updateViewportSize();

    const observer = new ResizeObserver(updateViewportSize);
    observer.observe(viewport);

    return () => observer.disconnect();
  }, []);

  function getGeometry(nextZoom = zoom) {
    if (
      !viewportSize.width ||
      !viewportSize.height ||
      !imageSize.width ||
      !imageSize.height
    ) {
      return null;
    }

    const baseScale = Math.max(
      viewportSize.width / imageSize.width,
      viewportSize.height / imageSize.height,
    );

    const scale = baseScale * nextZoom;
    const renderedWidth = imageSize.width * scale;
    const renderedHeight = imageSize.height * scale;

    return {
      scale,
      renderedWidth,
      renderedHeight,
      maxX: Math.max(0, (renderedWidth - viewportSize.width) / 2),
      maxY: Math.max(0, (renderedHeight - viewportSize.height) / 2),
    };
  }

  function clampOffset(nextOffset, nextZoom = zoom) {
    const geometry = getGeometry(nextZoom);

    if (!geometry) {
      return { x: 0, y: 0 };
    }

    return {
      x: Math.max(-geometry.maxX, Math.min(geometry.maxX, nextOffset.x)),
      y: Math.max(-geometry.maxY, Math.min(geometry.maxY, nextOffset.y)),
    };
  }

  function handleImageLoad(event) {
    setImageSize({
      width: event.currentTarget.naturalWidth,
      height: event.currentTarget.naturalHeight,
    });

    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }

  function handlePointerDown(event) {
    if (!getGeometry()) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
    };
  }

  function handlePointerMove(event) {
    if (!dragRef.current) {
      return;
    }

    const nextOffset = {
      x:
        dragRef.current.startOffsetX +
        (event.clientX - dragRef.current.startX),
      y:
        dragRef.current.startOffsetY +
        (event.clientY - dragRef.current.startY),
    };

    setOffset(clampOffset(nextOffset));
  }

  function stopDragging(event) {
    if (
      dragRef.current &&
      event.currentTarget.hasPointerCapture?.(dragRef.current.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(dragRef.current.pointerId);
    }

    dragRef.current = null;
  }

  function handleZoomChange(event) {
    const nextZoom = Number(event.target.value);

    setZoom(nextZoom);
    setOffset((current) => clampOffset(current, nextZoom));
  }

  async function applyCrop() {
    const image = imageRef.current;
    const geometry = getGeometry();

    if (!image || !geometry) {
      return;
    }

    setSaving(true);

    const imageLeft =
      viewportSize.width / 2 +
      offset.x -
      geometry.renderedWidth / 2;

    const imageTop =
      viewportSize.height / 2 +
      offset.y -
      geometry.renderedHeight / 2;

    const sourceX = Math.max(0, -imageLeft / geometry.scale);
    const sourceY = Math.max(0, -imageTop / geometry.scale);
    const sourceWidth = Math.min(
      imageSize.width - sourceX,
      viewportSize.width / geometry.scale,
    );
    const sourceHeight = Math.min(
      imageSize.height - sourceY,
      viewportSize.height / geometry.scale,
    );

    const outputWidth = isAvatar ? 600 : 1500;
    const outputHeight = isAvatar ? 600 : 500;

    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;

    const context = canvas.getContext('2d');

    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      outputWidth,
      outputHeight,
    );

    canvas.toBlob((blob) => {
      if (!blob) {
        setSaving(false);
        return;
      }

      const croppedUrl = URL.createObjectURL(blob);

      onApply({
        previewUrl: croppedUrl,
        blob,
      });

      setSaving(false);
    }, 'image/png');
  }

  const geometry = getGeometry();

  return (
    <div className="profile-crop-overlay">
      <section
        className="profile-crop-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="crop-editor-title"
      >
        <h2 id="crop-editor-title">
          {isAvatar ? 'Adjust profile picture' : 'Adjust profile banner'}
        </h2>

        <p className="profile-image-hint">
          Drag the image to reposition it, then use the slider to zoom.
        </p>

        <div
          ref={viewportRef}
          className={
            isAvatar
              ? 'profile-crop-viewport profile-crop-viewport--avatar'
              : 'profile-crop-viewport profile-crop-viewport--banner'
          }
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
        >
          <img
            ref={imageRef}
            className="profile-crop-image"
            src={source}
            alt=""
            draggable="false"
            onLoad={handleImageLoad}
            style={
              geometry
                ? {
                    width: `${geometry.renderedWidth}px`,
                    height: `${geometry.renderedHeight}px`,
                    transform:
                      `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
                  }
                : undefined
            }
          />

          {isAvatar && <div className="profile-crop-circle-guide" />}
        </div>

        <div className="profile-crop-controls">
          <label htmlFor="profile-crop-zoom">Zoom</label>

          <input
            id="profile-crop-zoom"
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={handleZoomChange}
          />
        </div>

        <div className="profile-edit-actions">
          <Button
            className="button--primary"
            type="button"
            onClick={applyCrop}
            disabled={saving}
          >
            {saving ? 'Applying…' : 'Apply'}
          </Button>

          <Button
            className="button--secondary"
            type="button"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
        </div>
      </section>
    </div>
  );
}

export default function Profile({
  paletteId,
  defaultMode,
  currentMode,
  onPaletteChange,
  onDefaultModeChange,
}) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isPersonalizing, setIsPersonalizing] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.openPersonalize) {
      setIsPersonalizing(true);

      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    }
  }, [location.state, location.pathname, navigate]);

  const [cropEditor, setCropEditor] = useState(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveNotice, setSaveNotice] = useState('');
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [locationMessage, setLocationMessage] = useState('');
  const locationRequestRef = useRef(0);

  // Forum posts state for the Posts tab
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState('');

  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
    location: '',
    showLocation: false,
    profilePicture: null,
    profilePictureFile: null,
    bannerPicture: null,
    bannerPictureFile: null,
  });

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        const response = await fetch('http://localhost:5000/profile/me', {
          credentials: 'include',
        });
        const result = await response.json().catch(() => ({}));
        if (!active) return;
        if (response.status === 401) {
          setIsUnauthorized(true);
          setLoadError('Log in to view your profile.');
        } else if (!response.ok) {
          setLoadError(result.error || 'Could not load your profile.');
        } else if (!result.profile) {
          setLoadError('The server returned no profile data.');
        } else {
          setProfile(result.profile);
        }
      } catch {
        if (active) setLoadError('Could not contact the server.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadProfile();
    return () => { active = false; };
  }, []);

  // Fetch user forum posts when the active tab is switched to 'Posts'
  useEffect(() => {
    if (activeTab === 'Posts') {
      let active = true;
      async function fetchUserPosts() {
        setPostsLoading(true);
        setPostsError('');
        try {
          const response = await fetch('http://localhost:5000/api/posts/me', {
            credentials: 'include',
          });
          const data = await response.json();
          if (!active) return;

          if (response.ok) {
            setUserPosts(data.posts || []);
          } else {
            setPostsError(data.error || 'Failed to load your posts.');
          }
        } catch (err) {
          if (active) setPostsError('Could not connect to server.');
        } finally {
          if (active) setPostsLoading(false);
        }
      }
      void fetchUserPosts();
      return () => { active = false; };
    }
  }, [activeTab]);

  const isOwnProfile = true;

  const tabs = ['Overview', 'Ratings', 'Tier Lists', 'Posts', 'Playlists'];

  if (profile?.isArtist) {
    tabs.push('Music');
  }

  function openEditProfile() {
    setSaveError('');
    setSaveNotice('');
    setLocationError('');
    setLocationMessage('');
    setEditForm({
      username: profile.username,
      bio: profile.bio,
      location: profile.location || '',
      showLocation: Boolean(profile.showLocation),
      profilePicture: profile.profilePicture,
      profilePictureFile: null,

      bannerPicture: profile.bannerPicture,
      bannerPictureFile: null,
    });

    setIsEditing(true);
  }

  function releaseDraftPreviews() {
    if (editForm.profilePictureFile && editForm.profilePicture?.startsWith('blob:')) {
      URL.revokeObjectURL(editForm.profilePicture);
    }
    if (editForm.bannerPictureFile && editForm.bannerPicture?.startsWith('blob:')) {
      URL.revokeObjectURL(editForm.bannerPicture);
    }
  }

  function closeEditProfile() {
    locationRequestRef.current += 1; // Ignore a pending lookup after closing.
    setLocating(false);
    releaseDraftPreviews();
    setCropEditor(null);
    setIsEditing(false);
  }

  function handleInputChange(event) {
    const { name, value } = event.target;

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));
  }


  function detectGeneralLocation() {
    setLocationError('');
    setLocationMessage('');

    if (!navigator.geolocation) {
      setLocationError('This browser does not support location detection. You can type a location instead.');
      return;
    }

    const requestId = ++locationRequestRef.current;
    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const params = new URLSearchParams({
            latitude: String(coords.latitude),
            longitude: String(coords.longitude),
            localityLanguage: 'en',
          });

          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?${params}`,
          );
          if (!response.ok) throw new Error('Location lookup was unsuccessful.');

          const result = await response.json();
          const parts = [
            result.city || result.locality,
            result.principalSubdivision,
            result.countryName,
          ].filter(Boolean);
          const suggestion = [...new Set(parts)].join(', ');

          if (!suggestion) throw new Error('No general location was returned.');
          if (locationRequestRef.current !== requestId) return;

          setEditForm((current) => ({ ...current, location: suggestion }));
          setLocationMessage('Suggestion added. You can edit it before saving.');
        } catch (error) {
          if (locationRequestRef.current === requestId) {
            setLocationError(error.message || 'Could not determine your location.');
          }
        } finally {
          if (locationRequestRef.current === requestId) setLocating(false);
        }
      },
      (error) => {
        if (locationRequestRef.current !== requestId) return;
        const message = error.code === 1
          ? 'Location access was denied. You can enter your location manually.'
          : error.code === 3
            ? 'Location detection timed out. Try again or enter it manually.'
            : 'Your location could not be detected. You can enter it manually.';
        setLocationError(message);
        setLocating(false);
      },
      { enableHighAccuracy: false, maximumAge: 0, timeout: 10000 },
    );
  }

  function chooseImage(event, type) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const source = URL.createObjectURL(file);

    setCropEditor({
      type,
      source,
    });

    event.target.value = '';
  }

  function applyCroppedImage({ previewUrl, blob }) {
    if (!cropEditor) {
      return;
    }

    const isAvatar = cropEditor.type === 'avatar';

    const imageField = isAvatar
      ? 'profilePicture'
      : 'bannerPicture';

    const fileField = isAvatar
      ? 'profilePictureFile'
      : 'bannerPictureFile';

    const fileName = isAvatar
      ? 'profile-picture.png'
      : 'profile-banner.png';

    const croppedFile = new File(
      [blob],
      fileName,
      { type: blob.type || 'image/png' },
    );

    URL.revokeObjectURL(cropEditor.source);

    setEditForm((current) => ({
      ...current,
      [imageField]: previewUrl,
      [fileField]: croppedFile,
    }));

    setCropEditor(null);
  }

  function cancelCrop() {
    if (cropEditor?.source) {
      URL.revokeObjectURL(cropEditor.source);
    }

    setCropEditor(null);
  }

  
async function handleSaveProfile(event) {
  event.preventDefault();
  setSaveError('');
  setSaveNotice('');
  setSaving(true);

  try {
    // Create form data containing profile details and images.
    const formData = new FormData();

    formData.append('username', editForm.username);
    formData.append('bio', editForm.bio);
    formData.append('location', editForm.location.trim());
    formData.append('show_location', String(editForm.showLocation && !!editForm.location.trim()));

    // Include cropped profile picture, if changed.
    if (editForm.profilePictureFile) {
      formData.append(
        'profile_picture',
        editForm.profilePictureFile
      );
    }

    // Include cropped banner picture, if changed.
    if (editForm.bannerPictureFile) {
      formData.append(
        'banner_picture',
        editForm.bannerPictureFile
      );
    }

    // Send profile changes to Flask.
    const response = await fetch(
      'http://localhost:5000/profile/me',
      {
        method: 'PATCH',
        credentials: 'include',
        body: formData,
      }
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        result.error || 'Could not save profile.'
      );
    }

    if (!result.profile) {
      throw new Error(
        'The server did not return an updated profile.'
      );
    }

    // Update profile using the saved database values.
    setProfile(result.profile);

    // Clean up temporary image previews.
    releaseDraftPreviews();

    locationRequestRef.current += 1;
    setLocating(false);
    setIsEditing(false);
    setSaveNotice('Profile saved successfully!');

  } catch (error) {
    setSaveError(
      error.message || 'Could not save profile.'
    );
  } finally {
    setSaving(false);
  }
}


  if (loading) {
    return <main className="profile-page"><p role="status">Loading profile…</p></main>;
  }
  if (loadError) {
    return (
      <main className="profile-page">
        <h1>Profile unavailable</h1>
        <p role="alert">{loadError}</p>
        {isUnauthorized && <Link to="/login">Log in</Link>}
      </main>
    );
  }

  return (
    <main className="profile-page">
      {saveNotice && <p role="status">{saveNotice}</p>}
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
            <span>{profile.username.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div className="profile-identity">
          <h1 className="profile-username">{profile.username}</h1>

          {profile.isArtist && (
            <span className="artist-badge">Verified Artist</span>
          )}

          {profile.location && (
            <p className="profile-location-display">
              <span aria-hidden="true">📍</span> {profile.location}
              {!profile.showLocation && (
                <span className="profile-location-private"> (Private — only you)</span>
              )}
            </p>
          )}

          <p className="profile-bio">{profile.bio}</p>


          {isOwnProfile ? (
            <div className="profile-actions">
              <Button className="button--secondary" onClick={openEditProfile}>
                Edit profile
              </Button>
              <Button className="button--secondary" onClick={() => setIsPersonalizing(true)}>
                Personalize
              </Button>
            </div>
          ) : (
            <Button className="button--primary">
              Follow
            </Button>
          )}
        </div>

        <section className="profile-stats">
          <div className="profile-stat">
            <strong>{profile.followers}</strong>
            <span>Followers</span>
          </div>

          <div className="profile-stat">
            <strong>{profile.following}</strong>
            <span>Following</span>
          </div>

          <div className="profile-stat">
            <strong>{profile.friends}</strong>
            <span>Friends</span>
          </div>

          <div className="profile-stat">
            <strong>{profile.ratings}</strong>
            <span>Ratings</span>
          </div>

          <div className="profile-stat">
            <strong>{profile.tierLists}</strong>
            <span>Tier Lists</span>
          </div>

          <div className="profile-stat">
            <strong>{profile.posts}</strong>
            <span>Posts</span>
          </div>

        </section>
      </section>

      <nav className="profile-tabs">
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
        {activeTab === 'Overview' && (
          <div className="profile-section">
            <h2>Overview</h2>
            <p>
              Recent activity and other general profile information
              can eventually go here.
            </p>
          </div>
        )}

        {activeTab === 'Ratings' && (
          <div className="profile-section">
            <h2>Ratings</h2>
            <p>Songs rated by this user will appear here.</p>
          </div>
        )}

        {activeTab === 'Tier Lists' && (
          <div className="profile-section">
            <h2>Tier Lists</h2>
            <p>Tier lists created by this user will appear here.</p>
          </div>
        )}

        {activeTab === 'Posts' && (
          //changes the post tab to indicate 
          <div className="profile-section">
            <h2>My Forum Posts</h2>
            {postsLoading && <p>Loading your posts...</p>}
            {postsError && <p role="alert" className="error-msg">{postsError}</p>}

            {!postsLoading && !postsError && userPosts.length === 0 ? (
              <p>You haven't posted anything in the forum yet.</p>
            ) : (
              userPosts.map((post) => (
                <article className="profile-post-card" key={post.id}>
                  <h3>{post.title}</h3>
                  <p>{post.body}</p>
                  {post.albums && (
                    <span className="profile-post-album">
                      Album: {post.albums.title || 'Attached Album'}
                    </span>
                  )}
                  <span className="post-date">
                    Posted on: {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </article>
              ))
            )}
          </div>
        )}

        {activeTab === 'Playlists' && (
          <div className="profile-section">
            <h2>Playlists</h2>
            <p>Playlists created by this user will appear here.</p>
          </div>
        )}

        {activeTab === 'Music' && profile.isArtist && (
          <div className="profile-section">
            <h2>Uploaded Music</h2>
            <p>Music uploaded by this artist will appear here.</p>
          </div>
        )}
      </section>

      {isEditing && (
        <div className="profile-edit-overlay">
          <section
            className="profile-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
          >
            <h2 id="edit-profile-title">Edit Profile</h2>

            <form onSubmit={handleSaveProfile}>
              <label htmlFor="edit-username">Username</label>
              <input
                id="edit-username"
                name="username"
                type="text"
                value={editForm.username}
                onChange={handleInputChange}
                minLength={3}
                maxLength={30}
                required
              />

              <label htmlFor="edit-bio">Bio</label>
              <textarea
                id="edit-bio"
                name="bio"
                value={editForm.bio}
                onChange={handleInputChange}
                maxLength={300}
                rows="4"
              />

              <div className="profile-location-setting">
                <h3>General location</h3>
                <label htmlFor="edit-location">Where are you based?</label>
                <input
                  id="edit-location"
                  name="location"
                  type="text"
                  value={editForm.location}
                  placeholder="City, region, or country"
                  maxLength={120}
                  onChange={(event) => {
                    const value = event.target.value;
                    setLocationError('');
                    setLocationMessage('');
                    setEditForm((current) => ({
                      ...current,
                      location: value,
                      showLocation: value.trim() ? current.showLocation : false,
                    }));
                  }}
                />
                <p className="profile-location-help">
                  Use a general location. This will be visible to other users if you choose to show it.
                </p>
                <Button
                  type="button"
                  className="button--secondary"
                  onClick={detectGeneralLocation}
                  disabled={locating || saving}
                >
                  {locating ? 'Finding location…' : '📍 Use my current location'}
                </Button>
                {locationError && <p className="profile-location-error" role="alert">{locationError}</p>}
                {locationMessage && <p className="profile-location-success" role="status">{locationMessage}</p>}
                <label className="profile-location-checkbox" htmlFor="edit-show-location">
                  <input
                    id="edit-show-location"
                    type="checkbox"
                    checked={editForm.showLocation}
                    disabled={!editForm.location.trim()}
                    onChange={(event) => setEditForm((current) => ({
                      ...current,
                      showLocation: event.target.checked,
                    }))}
                  />
                  Show this location on my public profile
                </label>
                <div className="profile-location-preview" aria-live="polite">
                  <strong>Public preview</strong>
                  <p>
                    {editForm.showLocation && editForm.location.trim()
                      ? `📍 ${editForm.location.trim()}`
                      : 'Location hidden from other users.'}
                  </p>
                </div>
              </div>

              <div className="profile-image-setting">
                <div>
                  <strong>Profile picture</strong>
                  <p>Square image shown as a circle on your profile.</p>
                </div>

                {editForm.profilePicture && (
                  <img
                    className="profile-edit-avatar-preview"
                    src={editForm.profilePicture}
                    alt="Current profile preview"
                  />
                )}

                <label className="button profile-file-button">
                  {editForm.profilePicture ? 'Change' : 'Choose image'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => chooseImage(event, 'avatar')}
                  />
                </label>
              </div>

              <div className="profile-image-setting">
                <div>
                  <strong>Profile banner</strong>
                  <p>Wide image displayed behind your profile picture.</p>
                </div>

                {editForm.bannerPicture && (
                  <img
                    className="profile-edit-banner-preview"
                    src={editForm.bannerPicture}
                    alt="Current banner preview"
                  />
                )}

                <label className="button profile-file-button">
                  {editForm.bannerPicture ? 'Change' : 'Choose image'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => chooseImage(event, 'banner')}
                  />
                </label>
              </div>

              {(editForm.profilePictureFile || editForm.bannerPictureFile) && (
                <p role="status">Selected pictures will upload when you press Save.</p>
              )}
              {saveError && <p role="alert">{saveError}</p>}
              <div className="profile-edit-actions">
                <Button className="button--primary" type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </Button>

                <Button
                  className="button--secondary"
                  type="button"
                  onClick={closeEditProfile}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}

      {cropEditor && (
        <CropEditor
          source={cropEditor.source}
          type={cropEditor.type}
          onApply={applyCroppedImage}
          onCancel={cancelCrop}
        />
      )}

      {isPersonalizing && (
        <PersonalizeModal
          onClose={() => setIsPersonalizing(false)}
          paletteId={paletteId}
          defaultMode={defaultMode}
          currentMode={currentMode}
          onPaletteChange={onPaletteChange}
          onDefaultModeChange={onDefaultModeChange}
        />
      )}
    </main>
  );
}