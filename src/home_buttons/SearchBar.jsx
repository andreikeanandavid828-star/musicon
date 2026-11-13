/**
 * Module: Search Bar
 * Design name: Header search form and navigation
 * Code date: 2026-11-12.
 * Programmer: Anthony Langer
 *
 * Purpose:
 *   Provides a controlled text search field in the shared header and opens
 *   the Search page with the query in the URL when submitted.
 *
 * Important functions:
 *   SearchBar() -> React element: takes no props; synchronizes its field with
 *     the current `q` query parameter.
 *   handleSubmit(event) -> void: prevents native form submission, trims the
 *     query, and navigates to /search?q=... when the query is non-empty.
 *
 * Important data structures:
 *   `query` is a string state value. URLSearchParams reads the current
 *   location's query parameters.
 *
 * Algorithms and design choices:
 *   Whitespace is trimmed before submit and encodeURIComponent safely
 *   encodes the query for a URL. An empty query does not navigate.
 */

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setQuery(new URLSearchParams(location.search).get('q') || '');
  }, [location.search]);

  function handleSubmit(event) {
    event.preventDefault();
    const searchQuery = query.trim();
    if (!searchQuery) return;

    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  }

  return (
    <form className="search-bar" role="search" onSubmit={handleSubmit}>
      <label className="search-bar__label" htmlFor="site-search">Search Musicon</label>
      <input
        id="site-search"
        className="search-bar__input"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search"
      />
      <button className="search-bar__submit" type="submit">Search</button>
    </form>
  );
}