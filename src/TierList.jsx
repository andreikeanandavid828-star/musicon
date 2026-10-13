import { useEffect, useRef, useState } from 'react';
import Button from './Button.jsx';
import { songs as availableSongs } from './songs.jsx';
import SongArtwork from './SongArtwork.jsx';

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
    const [listTitle, setListTitle] = useState('Untitled Tier List');
    const [titleDraft, setTitleDraft] = useState('Untitled Tier List');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
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
                                    onChange={(event) => setTitleDraft(event.target.value)}
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
                                </button>
                            )}
                        </h2>
                        <Button type="button">Share</Button>
                    </div>
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
                                            className="tierlist-song"
                                            draggable
                                            key={song.id}
                                            onDragStart={(event) => event.dataTransfer.setData('text/plain', song.id)}
                                        >
                                            {song.title}
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
                                    className="tierlist-song"
                                    draggable
                                    key={song.id}
                                    onDragStart={(event) => event.dataTransfer.setData('text/plain', song.id)}
                                >
                                    {song.title}
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