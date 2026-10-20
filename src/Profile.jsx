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

  // Open Personalize when requested by the account dropdown.
  useEffect(() => {
    if (location.state?.openPersonalize) {
      setIsPersonalizing(true);

      // Clear the request so it doesn't reopen on refresh.
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

  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
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

  const isOwnProfile = true;

  const tabs = ['Overview', 'Ratings', 'Tier Lists', 'Posts', 'Playlists'];

  if (profile?.isArtist) {
    tabs.push('Music');
  }

  function openEditProfile() {
    setSaveError('');
    setSaveNotice('');
    setEditForm({
      username: profile.username,
      bio: profile.bio,
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
          <div className="profile-section">
            <h2>Posts</h2>
            <p>Forum posts made by this user will appear here.</p>
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