/**
 * @fileoverview Exports the static sample song catalog used by frontend pages.
 * Replace or supplement this data with backend results when the catalog API is
 * connected.
 * @module songs
 * @author Anthony, Ian
 * @date 2026-10-13
 */

const musicFiles = import.meta.glob('../assets/TempMusic/*.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
});

export const songs = Object.entries(musicFiles)
  .map(([path, src]) => {
    const fileName = path.split('/').pop();
    const title = fileName.replace(/\.mp3$/i, '');

    return {
      id: title.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      title,
      src,
    };
  })
  .sort((a, b) => a.title.localeCompare(b.title));
