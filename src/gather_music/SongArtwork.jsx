import { useEffect, useState } from 'react';
import jsmediatags from 'jsmediatags/dist/jsmediatags.min.js';

export default function SongArtwork({ song, className = '' }) {
  const [artworkUrl, setArtworkUrl] = useState(null);

  useEffect(() => {
    let isCurrentSong = true;
    let objectUrl = null;
    setArtworkUrl(null);

    if (!song?.src) return undefined;

    const trackUrl = new URL(song.src, window.location.href).href;
    jsmediatags.read(trackUrl, {
      onSuccess: ({ tags }) => {
        const picture = tags.picture;
        if (!isCurrentSong || !picture?.data?.length) return;

        const image = new Blob([new Uint8Array(picture.data)], {
          type: picture.format || 'image/jpeg',
        });
        objectUrl = URL.createObjectURL(image);
        setArtworkUrl(objectUrl);
      },
      onError: () => {
        if (isCurrentSong) setArtworkUrl(null);
      },
    });

    return () => {
      isCurrentSong = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [song?.id, song?.src]);

  return (
    <div className={['song-artwork', className].filter(Boolean).join(' ')} aria-hidden="true">
      {artworkUrl && <img src={artworkUrl} alt="" />}
    </div>
  );
}
