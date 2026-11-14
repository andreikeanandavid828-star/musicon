/**
 * @fileoverview Exports the static sample song catalog used by frontend pages.
 * Replace or supplement this data with backend results when the catalog API is
 * connected.
 * @module songs
 * @author Anthony, Ian
 * @date 2026-10-13
 */

import neonDawnFade from '../assets/TempMusic/Neon Dawn Fade.mp3';
import neonDawnFadeAlternate from '../assets/TempMusic/Neon Dawn Fade (4).mp3';
import neonSkyTrain from '../assets/TempMusic/Neon SkyTrain.mp3';

export const songs = [
  { id: 'neon-skytrain', title: 'Neon SkyTrain', src: neonSkyTrain },
  { id: 'neon-dawn-fade', title: 'Neon Dawn Fade', src: neonDawnFade },
  {
    id: 'neon-dawn-fade-alternate',
    title: 'Neon Dawn Fade (4)',
    src: neonDawnFadeAlternate,
  },
];
