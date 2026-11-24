import artistCoverAD from '../assets/7_artist_profile_covers/01_A-D.png';
import artistCoverEH from '../assets/7_artist_profile_covers/02_E-H.png';
import artistCoverIL from '../assets/7_artist_profile_covers/03_I-L.png';
import artistCoverMP from '../assets/7_artist_profile_covers/04_M-P.png';
import artistCoverQT from '../assets/7_artist_profile_covers/05_Q-T.png';
import artistCoverUZ from '../assets/7_artist_profile_covers/06_U-Z.png';
import artistCoverNumbersSymbols from '../assets/7_artist_profile_covers/07_Numbers-Symbols.png';

const ARTIST_PROFILE_COVERS = {
  'A-D': artistCoverAD,
  'E-H': artistCoverEH,
  'I-L': artistCoverIL,
  'M-P': artistCoverMP,
  'Q-T': artistCoverQT,
  'U-Z': artistCoverUZ,
  'Numbers-Symbols': artistCoverNumbersSymbols,
};

/**
 * Selects the artist portrait corresponding to the artist name's initial.
 *
 * @param {string} name Artist name.
 * @returns {string | null} The matching portrait URL, or null without a name.
 */
export function getArtistProfileCover(name) {
  const initial = typeof name === 'string'
    ? name.trim().normalize('NFD').replace(/\p{Diacritic}/gu, '').charAt(0).toUpperCase()
    : '';

  if (!initial) return null;

  const group = initial >= 'A' && initial <= 'D' ? 'A-D'
    : initial >= 'E' && initial <= 'H' ? 'E-H'
      : initial >= 'I' && initial <= 'L' ? 'I-L'
        : initial >= 'M' && initial <= 'P' ? 'M-P'
          : initial >= 'Q' && initial <= 'T' ? 'Q-T'
            : initial >= 'U' && initial <= 'Z' ? 'U-Z'
              : 'Numbers-Symbols';

  return ARTIST_PROFILE_COVERS[group];
}
