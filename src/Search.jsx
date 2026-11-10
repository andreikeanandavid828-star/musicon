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