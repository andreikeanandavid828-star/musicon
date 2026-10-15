import { useEffect, useRef, useState } from 'react';
import Button from './Button.jsx';
import { songs as availableSongs } from './songs.jsx';
import SongArtwork from './SongArtwork.jsx';

const DEFAULT_TIER_LIST_TITLE = 'Untitled Tier List';

const emptyTierList = () => ({
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    neutral: [],
});

export default function TierList() {
    const [hasCreatedList, setHasCreatedList] = useState(false);
    const [tiers, setTiers] = useState(emptyTierList);
    const [isSongPickerOpen, setIsSongPickerOpen] = useState(false);
    const [listTitle, setListTitle] = useState(DEFAULT_TIER_LIST_TITLE);
    const [titleDraft, setTitleDraft] = useState(DEFAULT_TIER_LIST_TITLE);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [shareNotice, setShareNotice] = useState('');
    const songPickerRef = useRef(null);

    useEffect(() => {
        const dialog = songPickerRef.current;
        if (!dialog) return;

        if (isSongPickerOpen && !dialog.open) dialog.showModal();
        if (!isSongPickerOpen && dialog.open) dialog.close();
    }, [isSongPickerOpen]);

    const addedSongIds = new Set(
        Object.values(tiers).flat().map((song) => song.catalogId),
    );

    function finishTitleEdit() {
        const title = titleDraft.trim();
        if (title) setListTitle(title);
        setIsEditingTitle(false);
    }

    function handleShare() {
        if (listTitle === DEFAULT_TIER_LIST_TITLE) {
            setShareNotice('Name your tier list before sharing.');
            setTitleDraft(listTitle);
            setIsEditingTitle(true);
            return;
        }

        setShareNotice('Sharing will be available soon.');
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
            {!hasCreatedList ? (
                <section className="tierlist-start" aria-label="Tier list options">
                    <p>Choose from the available songs and rank your favorites.</p>
                    <div className="tierlist-actions">
                        <Button className="button--primary" onClick={() => {
                            setTiers(emptyTierList());
                            setHasCreatedList(true);
                        }}>
                            New Tier List
                        </Button>
                        <Button onClick={() => { }}>Find a Public Tier List</Button>
                    </div>
                </section>
            ) : (
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
                        <Button type="button" onClick={handleShare}>Share</Button>
                    </div>
                    {shareNotice && (
                        <p className="tierlist-share-notice" role="status">
                            {shareNotice}
                        </p>
                    )}
                    <div className="tierlist-rows">
                        {['S', 'A', 'B', 'C', 'D'].map((tierName) => (
                            <div
                                className={`tierlist-row tierlist-row--${tierName.toLowerCase()}`}
                                key={tierName}
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={(event) => moveSong(event, tierName)}
                            >
                                <h3>{tierName}</h3>
                                <div className="tierlist-songs" aria-label={`${tierName} tier`}>
                                    {tiers[tierName].map((song) => (
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