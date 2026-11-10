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