const genreCoverFiles = import.meta.glob('../assets/7_genre_song_covers/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

const genreCovers = Object.fromEntries(
  Object.entries(genreCoverFiles).map(([path, url]) => {
    const fileName = path.split('/').pop().replace(/\.png$/i, '');
    return [fileName.toLocaleLowerCase().replace(/[^a-z0-9]/g, ''), url];
  }),
);

function getSongGenres(genre) {
  const values = Array.isArray(genre) ? genre : [genre];
  return values
    .flatMap((value) => typeof value === 'string' ? value.split(/[,;|\n]+/) : [])
    .map((value) => value.trim())
    .filter(Boolean);
}

/**
 * Returns the cover image matching the song genre, if one is available.
 *
 * @param {Object} song - Song whose genre determines the cover.
 * @param {string} [selectedGenre='all'] - Optional genre selected in search.
 * @returns {string|null} Matching genre cover URL, or null.
 */
export function getGenreCover(song, selectedGenre = 'all') {
  const songGenres = getSongGenres(song?.genre);
  const genre = selectedGenre === 'all'
    ? songGenres[0]
    : songGenres.find(
      (songGenre) => songGenre.toLocaleLowerCase() === selectedGenre.toLocaleLowerCase(),
    );
  if (!genre) return null;

  let genreKey = genre.toLocaleLowerCase().replace(/[^a-z0-9]/g, '');
  if (['dance', 'electronic', 'edm'].includes(genreKey)) {
    genreKey = 'danceelectronic';
  }

  return genreCovers[genreKey] || null;
}
