/**
 * Module: Search Page
 * Design name: Search filter tab view
 * Code date: 2026-11-12.
 * Programmer: Ian Flack, Anthony Langer
 *
 * Purpose:
 *   Presents the search filters and shows a heading for the active category.
 *   Search-result retrieval is not implemented in this component.
 *
 * Important functions:
 *   Search() -> React element: takes no props; renders tabs for songs,
 *     artists, posts, playlists, and tierlists, with songs selected initially.
 *   The tab click handler accepts a filter string and updates active state;
 *     the component renders the selected category title.
 *
 * Important data structures:
 *   `searchFilters` is a string array; `activeFilter` is a string state value.
 *
 * Algorithms and design choices:
 *   The category list is mapped to buttons, and the selected category is
 *   exposed with aria-selected. No search algorithm is used.
 */

import { useState } from 'react';

const searchFilters = ['songs', 'artists', 'posts', 'playlists', 'tierlists'];

export default function Search() {
  const [activeFilter, setActiveFilter] = useState('songs');

  return (
    <main className="search-page">
      <div className="search-page__tabs" role="tablist" aria-label="Search filters">
        {searchFilters.map((filter) => (
          <button
            key={filter}
            className="search-page__tab"
            type="button"
            role="tab"
            aria-selected={activeFilter === filter}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
      <section className="search-page__results" role="tabpanel">
        <h1>{activeFilter[0].toUpperCase() + activeFilter.slice(1)}</h1>
      </section>
    </main>
  );
}