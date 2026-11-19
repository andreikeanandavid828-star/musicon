import { useEffect, useRef, useState } from 'react';
import Button from '../../Button.jsx';
import { songs as availableSongs } from '../../gather_music/songs.jsx';
import SongArtwork from '../../gather_music/SongArtwork.jsx';

/**
 * @fileoverview Implements the interactive song tier-list editor and public browser.
 * @module TierList
 */

const DEFAULT_TIER_LIST_TITLE = 'Untitled Tier List';
const DEFAULT_TIER_NAMES = {
    S: 'S',
    A: 'A',
    B: 'B',
    C: 'C',
    D: 'D',
};
const TIER_KEYS = Object.keys(DEFAULT_TIER_NAMES);

const emptyTierList = () => ({
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    neutral: [],
});

export default function TierList() {
    // View modes: 'menu' | 'editor' | 'public-feed' | 'public-view'
    const [viewMode, setViewMode] = useState('menu');
    const [publicLists, setPublicLists] = useState([]);
    const [selectedPublicList, setSelectedPublicList] = useState(null);
    const [feedError, setFeedError] = useState('');

    const [tiers, setTiers] = useState(emptyTierList);
    const [isSongPickerOpen, setIsSongPickerOpen] = useState(false);
    const [listTitle, setListTitle] = useState(DEFAULT_TIER_LIST_TITLE);
    const [titleDraft, setTitleDraft] = useState(DEFAULT_TIER_LIST_TITLE);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [tierNames, setTierNames] = useState(DEFAULT_TIER_NAMES);
    const [tierDraft, setTierDraft] = useState('');
    const [editingTier, setEditingTier] = useState(null);
    const [shareNotice, setShareNotice] = useState('');
    const songPickerRef = useRef(null);
    const canceledTierEditRef = useRef(null);

    useEffect(() => {
        const dialog = songPickerRef.current;
        if (!dialog) return;

        if (isSongPickerOpen && !dialog.open) dialog.showModal();
        if (!isSongPickerOpen && dialog.open) dialog.close();
    }, [isSongPickerOpen]);

    async function loadPublicTierLists() {
        setFeedError('');
        try {
            const response = await fetch('http://localhost:5000/api/tierlists', {
                credentials: 'include',
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to load public tier lists');
            setPublicLists(data.tier_lists || []);
            setViewMode('public-feed');
        } catch (err) {
            setFeedError(err.message || 'Could not load public tier lists.');
            setViewMode('public-feed');
        }
    }

    const addedSongIds = new Set(
        Object.values(tiers).flat().map((song) => song.catalogId),
    );

    function finishTitleEdit() {
        const title = titleDraft.trim();
        if (title) setListTitle(title);
        setIsEditingTitle(false);
    }

    function finishTierEdit(tierKey) {
        if (canceledTierEditRef.current === tierKey) {
            canceledTierEditRef.current = null;
            return;
        }

        const name = tierDraft.trim();
        if (name) {
            setTierNames((currentNames) => ({ ...currentNames, [tierKey]: name }));
        }
        setEditingTier(null);
    }

    async function handleShare() {
        if (listTitle === DEFAULT_TIER_LIST_TITLE) {
            setShareNotice('Name your tier list before sharing.');
            setTitleDraft(listTitle);
            setIsEditingTitle(true);
            return;
        }

        try {
            setShareNotice('Saving and publishing...');
            const response = await fetch('http://localhost:5000/api/tierlists', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: listTitle,
                    tiers: tiers,
                    tierNames: tierNames,
                    is_public: true,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to save');

            const shareUrl = `${window.location.origin}/tierlist/${data.tier_list.id}`;
            navigator.clipboard.writeText(shareUrl);
            setShareNotice('Published! Link copied to clipboard.');
        } catch (err) {
            setShareNotice('Could not save tier list. Are you logged in?');
        }
    }

    function addSong(song) {
        if (addedSongIds.has(song.id)) return;

        setTiers((currentTiers) => ({
            ...currentTiers,
            neutral: [
                ...currentTiers.neutral,
                {
                    id: `${song.id}-${Date.now()}-${Math.random()}`,
                    catalogId: song.id,
                    title: song.title,
                    src: song.src,
                },
            ],
        }));
        setIsSongPickerOpen(false);
    }

    function moveSong(event, destination) {
        event.preventDefault();
        const songId = event.dataTransfer.getData('text/plain');
        if (!songId) return;

        setTiers((currentTiers) => {
            let movedSong;
            const nextTiers = Object.fromEntries(
                Object.entries(currentTiers).map(([tierName, songs]) => [
                    tierName,
                    songs.filter((song) => {
                        if (song.id !== songId) return true;
                        movedSong = song;
                        return false;
                    }),
                ]),
            );

            if (movedSong) nextTiers[destination] = [...nextTiers[destination], movedSong];
            return nextTiers;
        });
    }

    return (
        <main className="tierlist-page">
            <h1>Tier List</h1>

            {viewMode === 'menu' && (
                <section className="tierlist-start" aria-label="Tier list options">
                    <p>Choose from the available songs and rank your favorites.</p>
                    <div className="tierlist-actions">
                        <Button
                            className="button--primary"
                            onClick={() => {
                                setTiers(emptyTierList());
                                setTierNames(DEFAULT_TIER_NAMES);
                                setListTitle(DEFAULT_TIER_LIST_TITLE);
                                setShareNotice('');
                                setViewMode('editor');
                            }}
                        >
                            New Tier List
                        </Button>
                        <Button onClick={loadPublicTierLists}>Find a Public Tier List</Button>
                    </div>
                </section>
            )}

            {viewMode === 'public-feed' && (
                <section className="tierlist-feed" aria-label="Public tier lists">
                    <div className="tierlist-titlebar">
                        <h2>Public Tier Lists</h2>
                        <Button type="button" onClick={() => setViewMode('menu')}>← Back</Button>
                    </div>

                    {feedError && <p role="alert" className="error-msg">{feedError}</p>}

                    {publicLists.length === 0 ? (
                        <p>No public tier lists yet. Create and share one to be the first!</p>
                    ) : (
                        <div className="forum-list">
                            {publicLists.map((item) => (
                                <article
                                    key={item.id}
                                    className="forum-post"
                                    style={{ cursor: 'pointer', padding: '16px', marginBottom: '12px' }}
                                    onClick={() => {
                                        setSelectedPublicList(item);
                                        setViewMode('public-view');
                                    }}
                                >
                                    <h3>{item.title}</h3>
                                    <span className="forum-post-meta">
                                        Created by {item.users?.username || 'Anonymous'}
                                    </span>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {viewMode === 'public-view' && selectedPublicList && (
                <section className="tierlist-board" aria-label="Public tier list view">
                    <div className="tierlist-titlebar">
                        <div>
                            <h2>{selectedPublicList.title}</h2>
                            <span className="forum-post-meta">
                                Created by {selectedPublicList.users?.username || 'Anonymous'}
                            </span>
                        </div>
                        <Button type="button" onClick={loadPublicTierLists}>← Back to Public Lists</Button>
                    </div>

                    <div className="tierlist-rows">
                        {TIER_KEYS.map((tierKey) => {
                            const labels = selectedPublicList.tier_names || DEFAULT_TIER_NAMES;
                            const rowSongs = selectedPublicList.tiers?.[tierKey] || [];
                            return (
                                <div className={`tierlist-row tierlist-row--${tierKey.toLowerCase()}`} key={tierKey}>
                                    <h3>{labels[tierKey] || tierKey}</h3>
                                    <div className="tierlist-songs">
                                        {rowSongs.map((song) => (
                                            <div
                                                className="tierlist-song tierlist-song--artwork"
                                                title={song.title}
                                                aria-label={song.title}
                                                role="img"
                                                key={song.id}
                                            >
                                                <SongArtwork song={song} className="tierlist-song__artwork" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {viewMode === 'editor' && (
                <section className="tierlist-board" aria-label="Tier list editor">
                    <div className="tierlist-titlebar">
                        <h2>
                            {isEditingTitle ? (
                                <input
                                    className="form-input tierlist-title-input"
                                    aria-label="Tier list title"
                                    autoFocus
                                    value={titleDraft}
                                    onChange={(event) => {
                                        setTitleDraft(event.target.value);
                                        setShareNotice('');
                                    }}
                                    onBlur={finishTitleEdit}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') finishTitleEdit();
                                        if (event.key === 'Escape') {
                                            setTitleDraft(listTitle);
                                            setIsEditingTitle(false);
                                        }
                                    }}
                                />
                            ) : (
                                <button
                                    className="tierlist-title-button"
                                    type="button"
                                    onClick={() => {
                                        setTitleDraft(listTitle);
                                        setIsEditingTitle(true);
                                    }}
                                    aria-label={`Edit tier list title: ${listTitle}`}
                                >
                                    {listTitle}
                                    <svg
                                        className="tierlist-title-pencil"
                                        viewBox="0 0 16 16"
                                        aria-hidden="true"
                                    >
                                        <path d="M11.7 1.3a1 1 0 0 1 1.4 0l1.6 1.6a1 1 0 0 1 0 1.4l-9.2 9.2-3.5.7.7-3.5 9-9.4ZM2.9 11.2l-.3 1.3 1.3-.3 7.7-7.7-1-1-7.7 7.7Z" />
                                    </svg>
                                </button>
                            )}
                        </h2>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button type="button" onClick={() => setViewMode('menu')}>← Back</Button>
                            <Button type="button" onClick={handleShare}>Share</Button>
                        </div>
                    </div>
                    {shareNotice && (
                        <p className="tierlist-share-notice" role="status">
                            {shareNotice}
                        </p>
                    )}
                    <div className="tierlist-rows">
                        {TIER_KEYS.map((tierKey) => (
                            <div
                                className={`tierlist-row tierlist-row--${tierKey.toLowerCase()}`}
                                key={tierKey}
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={(event) => moveSong(event, tierKey)}
                            >
                                <h3>
                                    {editingTier === tierKey ? (
                                        <input
                                            className="form-input tierlist-tier-input"
                                            aria-label={`${tierKey} tier name`}
                                            autoFocus
                                            value={tierDraft}
                                            onChange={(event) => setTierDraft(event.target.value)}
                                            onBlur={() => finishTierEdit(tierKey)}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter') event.currentTarget.blur();
                                                if (event.key === 'Escape') {
                                                    canceledTierEditRef.current = tierKey;
                                                    setTierDraft(tierNames[tierKey]);
                                                    setEditingTier(null);
                                                }
                                            }}
                                        />
                                    ) : (
                                        <button
                                            className="tierlist-tier-button"
                                            type="button"
                                            aria-label={`Edit ${tierNames[tierKey]} tier name`}
                                            onClick={() => {
                                                canceledTierEditRef.current = null;
                                                setTierDraft(tierNames[tierKey]);
                                                setEditingTier(tierKey);
                                            }}
                                        >
                                            {tierNames[tierKey]}
                                        </button>
                                    )}
                                </h3>
                                <div className="tierlist-songs" aria-label={`${tierNames[tierKey]} tier`}>
                                    {tiers[tierKey].map((song) => (
                                        <div
                                            className="tierlist-song tierlist-song--artwork"
                                            title={song.title}
                                            aria-label={song.title}
                                            role="img"
                                            draggable
                                            key={song.id}
                                            onDragStart={(event) => event.dataTransfer.setData('text/plain', song.id)}
                                        >
                                            <SongArtwork song={song} className="tierlist-song__artwork" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div
                        className="tierlist-neutral"
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => moveSong(event, 'neutral')}
                    >
                        <div className="tierlist-songs">
                            {tiers.neutral.map((song) => (
                                <div
                                    className="tierlist-song tierlist-song--artwork"
                                    title={song.title}
                                    aria-label={song.title}
                                    role="img"
                                    draggable
                                    key={song.id}
                                    onDragStart={(event) => event.dataTransfer.setData('text/plain', song.id)}
                                >
                                    <SongArtwork song={song} className="tierlist-song__artwork" />
                                </div>
                            ))}
                        </div>
                        <Button
                            className="button--primary"
                            type="button"
                            onClick={() => setIsSongPickerOpen(true)}
                        >
                            Add new song
                        </Button>
                    </div>
                </section>
            )}

            <dialog
                ref={songPickerRef}
                className="tierlist-song-picker"
                aria-labelledby="tierlist-song-picker-title"
                onClose={() => setIsSongPickerOpen(false)}
            >
                <div className="tierlist-song-picker__header">
                    <div>
                        <h2 id="tierlist-song-picker-title">Choose a song</h2>
                        <p>Select a song to add it to your tier list.</p>
                    </div>
                    <Button
                        type="button"
                        aria-label="Close song picker"
                        onClick={() => setIsSongPickerOpen(false)}
                    >
                        Close
                    </Button>
                </div>
                <div className="tierlist-song-picker__list">
                    {availableSongs.map((song) => {
                        const isAdded = addedSongIds.has(song.id);

                        return (
                            <button
                                className="tierlist-song-picker__option"
                                type="button"
                                key={song.id}
                                disabled={isAdded}
                                onClick={() => addSong(song)}
                            >
                                <span className="tierlist-song-picker__title">
                                    <SongArtwork song={song} className="song-artwork--picker" />
                                    <span>{song.title}</span>
                                </span>
                                <span className="tierlist-song-picker__status">
                                    {isAdded ? 'Added' : 'Add to tier list'}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </dialog>
        </main>
    );
}