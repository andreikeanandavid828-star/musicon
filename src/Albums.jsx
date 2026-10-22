import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from './Button.jsx';
import SongArtwork from './SongArtwork.jsx';

export default function Albums({
    albums,
    songs,
    onCreateAlbum,
    onAddSongs,
    selectedSong,
    onSelectSong,
}) {
    const { albumId } = useParams();
    const navigate = useNavigate();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isAddSongDialogOpen, setIsAddSongDialogOpen] = useState(false);
    const createDialogRef = useRef(null);
    const addSongDialogRef = useRef(null);
    const selectedAlbum = albums.find((album) => album.id === albumId);
    const selectedSongIds = selectedAlbum?.songIds || [];
    const albumSongs = selectedSongIds
        .map((songId) => songs.find((song) => song.id === songId))
        .filter(Boolean);
    const albumCoverSong = albumSongs[0];
    const songsNotInAlbum = songs.filter((song) => !selectedSongIds.includes(song.id));

    useEffect(() => {
        const createDialog = createDialogRef.current;
        const addSongDialog = addSongDialogRef.current;

        if (createDialog && isCreateDialogOpen && !createDialog.open) createDialog.showModal();
        if (createDialog && !isCreateDialogOpen && createDialog.open) createDialog.close();
        if (addSongDialog && isAddSongDialogOpen && !addSongDialog.open) addSongDialog.showModal();
        if (addSongDialog && !isAddSongDialogOpen && addSongDialog.open) addSongDialog.close();
    }, [isCreateDialogOpen, isAddSongDialogOpen]);

    function handleCreateAlbum(event) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const name = formData.get('album').trim();

        if (!name) return;

        const newAlbum = {
            id: `${Date.now()}-${Math.random()}`,
            name,
            songIds: [],
        };
        onCreateAlbum(newAlbum);
        setIsCreateDialogOpen(false);
        navigate(`/albums/${newAlbum.id}`);
    }

    function handleAddSongs(event) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const songIds = formData.getAll('songs');

        if (!albumId || songIds.length === 0) return;

        onAddSongs(albumId, songIds);
        setIsAddSongDialogOpen(false);
    }

    if (albumId) {
        return (
            <main className="albums-page">
                <Link className="albums-back-link" to="/albums">Back to albums</Link>
                {!selectedAlbum ? (
                    <p className="albums-empty">Album not found.</p>
                ) : (
                    <>
                        <div className="album-detail-heading">
                            <SongArtwork song={albumCoverSong} className="album-cover album-cover--detail" />
                            <h1>{selectedAlbum.name}</h1>
                        </div>
                        <div className="album-detail-actions">
                            <Button className="button--primary" onClick={() => setIsAddSongDialogOpen(true)}>
                                Add song
                            </Button>
                        </div>
                        {albumSongs.length === 0 ? (
                            <p className="albums-empty">
                                Nothing in this album yet. Add a song here, or <Link to="/upload">go to Upload</Link> to add one to the Home catalog.
                            </p>
                        ) : (
                            <ul className="album-songs" aria-label={`Songs in ${selectedAlbum.name}`}>
                                {albumSongs.map((song) => (
                                    <li key={song.id}>
                                        <button
                                            className="album-songs__item"
                                            type="button"
                                            aria-pressed={selectedSong?.id === song.id}
                                            onClick={() => onSelectSong(song, albumId)}
                                        >
                                            <SongArtwork song={song} className="song-artwork--home" />
                                            <span className="album-songs__title">{song.title}</span>
                                            <span className="album-songs__artist">{song.artist || 'Unknown artist'}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <dialog
                            ref={addSongDialogRef}
                            className="tierlist-song-picker album-dialog"
                            aria-labelledby="add-album-songs-title"
                            onClose={() => setIsAddSongDialogOpen(false)}
                        >
                            <div className="tierlist-song-picker__header">
                                <div>
                                    <h2 id="add-album-songs-title">Add songs to {selectedAlbum.name}</h2>
                                    <p>Choose songs from the Home catalog.</p>
                                </div>
                                <Button type="button" onClick={() => setIsAddSongDialogOpen(false)}>Close</Button>
                            </div>
                            <form className="album-form" onSubmit={handleAddSongs}>
                                <div className="album-form__actions">
                                    <Button className="button--primary" type="submit">Add selected songs</Button>
                                </div>
                                {songsNotInAlbum.length === 0 ? (
                                    <p className="albums-empty">
                                        No songs available to add. <Link to="/upload">Upload a song</Link> first.
                                    </p>
                                ) : (
                                    <fieldset className="album-song-picker">
                                        <legend>Available songs</legend>
                                        <div className="album-song-options">
                                            {songsNotInAlbum.map((song) => (
                                                <label key={song.id}>
                                                    <input type="checkbox" name="songs" value={song.id} />
                                                    <span>{song.title}{song.artist ? ` - ${song.artist}` : ''}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>
                                )}
                            </form>
                        </dialog>
                    </>
                )}
            </main>
        );
    }

    return (
        <main className="albums-page">
            <div className="albums-heading">
                <h1>Albums</h1>
                <Button className="button--primary" onClick={() => setIsCreateDialogOpen(true)}>
                    Create album
                </Button>
            </div>
            {albums.length === 0 ? (
                <p className="albums-empty">No albums yet. Create an album and choose songs from the catalog.</p>
            ) : (
                <ul className="albums-list" aria-label="Posted albums">
                    {albums.map((album) => {
                        const firstSong = (album.songIds || [])
                            .map((songId) => songs.find((song) => song.id === songId))
                            .find(Boolean);

                        return (
                            <li key={album.id}>
                                <Link className="albums-list__item" to={`/albums/${album.id}`}>
                                    <SongArtwork song={firstSong} className="album-cover" />
                                    <div className="albums-list__details">
                                        <h2>{album.name}</h2>
                                        <span>{(album.songIds || []).length} songs</span>
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
            <dialog
                ref={createDialogRef}
                className="tierlist-song-picker album-dialog"
                aria-labelledby="create-album-title"
                onClose={() => setIsCreateDialogOpen(false)}
            >
                <div className="tierlist-song-picker__header">
                    <div>
                        <h2 id="create-album-title">Create an album</h2>
                        <p>Choose songs from the Home catalog, including songs you uploaded.</p>
                    </div>
                    <Button type="button" onClick={() => setIsCreateDialogOpen(false)}>Close</Button>
                </div>
                <form className="album-form" onSubmit={handleCreateAlbum}>
                    <div className="album-form__actions">
                        <Button className="button--primary" type="submit">Create album</Button>
                    </div>
                    <label htmlFor="create-album-name">Album name</label>
                    <input className="form-input" id="create-album-name" name="album" maxLength="120" required />
                </form>
            </dialog>
        </main>
    );
}
