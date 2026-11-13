/**
 * Module: Song Artwork
 * Design name: Embedded audio-artwork renderer
 * Code date: 2026-11-12.
 * Programmer: Anthony Langer
 *
 * Purpose:
 *   Reads embedded artwork metadata from a song audio source and renders the
 *   discovered image as decorative artwork.
 *
 * Important functions:
 *   SongArtwork({ song, className }) -> React element: accepts a song object
 *   with optional `src` and an optional CSS class; returns a decorative
 *   artwork container with an image when metadata is available.
 *   The metadata success callback builds a Blob/object URL from picture
 *   bytes; the error callback clears artwork state for the current song.
 *
 * Important data structures:
 *   `song` contains id/src; metadata picture contains byte data and format.
 *   `artworkUrl` stores a temporary browser object URL.
 *
 * Algorithms and design choices:
 *   A current-song guard ignores late asynchronous metadata responses after
 *   unmount or song change. Object URLs are revoked on cleanup to release
 *   browser resources.
 */

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
