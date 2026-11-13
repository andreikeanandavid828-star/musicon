/**
 * Module: Sample Song Catalog
 * Design name: Local song metadata collection
 * Code date: 2026-11-12.
 * Programmer: Ian Flack, Anthony Langer
 *
 * Purpose:
 *   Exports the sample audio tracks bundled with the frontend for catalog,
 *   playback, and tier-list features.
 *
 * Important functions:
 *   No functions are defined. `songs` is the exported catalog value.
 *
 * Important data structures:
 *   `songs` is an array of objects with stable string `id`, display `title`,
 *   and imported audio `src` values.
 *
 * Algorithms and design choices:
 *   Tracks are statically imported so the bundler can package and fingerprint
 *   local audio assets. No runtime search or selection algorithm is used.
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
