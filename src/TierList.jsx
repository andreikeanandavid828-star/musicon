import { Link } from 'react-router-dom';
import { useState } from 'react';
import Button from './Button.jsx';

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
    const [songName, setSongName] = useState('');
    const [listTitle, setListTitle] = useState('Untitled Tier List');
    const [titleDraft, setTitleDraft] = useState('Untitled Tier List');
    const [isEditingTitle, setIsEditingTitle] = useState(false);

    function finishTitleEdit() {
        const title = titleDraft.trim();
        if (title) setListTitle(title);
        setIsEditingTitle(false);
    }

    function addSong(event) {
        event.preventDefault();
        const name = songName.trim();
        if (!name) return;

        setTiers((currentTiers) => ({
            ...currentTiers,
            neutral: [...currentTiers.neutral, { id: `${Date.now()}-${Math.random()}`, name }],
        }));
        setSongName('');
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
                    <p>Make a tier list with any songs you like.</p>
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
                                            {song.name}
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
                                    {song.name}
                                </div>
                            ))}
                        </div>
                        <form className="tierlist-song-form" onSubmit={addSong}>
                            <label className="visually-hidden" htmlFor="tierlist-song-name">Song name</label>
                            <input
                                id="tierlist-song-name"
                                className="form-input"
                                value={songName}
                                onChange={(event) => setSongName(event.target.value)}
                                placeholder="Type a song name"
                            />
                            <Button className="button--primary" type="submit">Add Song</Button>
                        </form>
                    </div>
                </section>
            )}
        </main>
    );
}