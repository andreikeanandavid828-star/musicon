import { useEffect, useState } from 'react';
import jsmediatags from 'jsmediatags/dist/jsmediatags.min.js';

/**
 * @fileoverview Extracts and displays embedded artwork from a song's audio
 * metadata.
 * @module SongArtwork
 * @author Anthony, Ian
 * @date 2026-10-13
 */

/**
 * Reads a song's embedded artwork and releases its temporary object URL when
 * the song changes or the component unmounts.
 *
 * @param {Object} props - Artwork source and optional styling.
 * @param {Object|null} props.song - Song with an optional audio `src`.
 * @param {string} [props.className=''] - Additional CSS classes.
 * @returns {React.JSX.Element} Artwork container, with an image when available.
 */
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
