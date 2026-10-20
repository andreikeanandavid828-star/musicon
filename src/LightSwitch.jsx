export default function LightSwitch({ toggleTheme, isDarkMode }) {
  return (
    <label className="switch">
      <input
        id="input"
        type="checkbox"
        checked={isDarkMode}
        onChange={toggleTheme}
        aria-label="Dark mode"
      />
      <span className="slider round" aria-hidden="true">
        <span className="sun-moon">
          <span id="moon-dot-1" className="moon-dot" />
          <span id="moon-dot-2" className="moon-dot" />
          <span id="moon-dot-3" className="moon-dot" />
        </span>
        {[1, 2, 3].map((number) => (
          <svg key={`light-cloud-${number}`} id={`cloud-${number}`} className="cloud cloud-light" viewBox="0 0 40 20" aria-hidden="true">
            <path d="M4 18h29a6 6 0 0 0 0-12 9 9 0 0 0-17-1A7 7 0 0 0 4 18Z" />
          </svg>
        ))}
        {[4, 5, 6].map((number) => (
          <svg key={`dark-cloud-${number}`} id={`cloud-${number}`} className="cloud cloud-dark" viewBox="0 0 40 20" aria-hidden="true">
            <path d="M4 18h29a6 6 0 0 0 0-12 9 9 0 0 0-17-1A7 7 0 0 0 4 18Z" />
          </svg>
        ))}
        <span className="stars">
          <svg id="star-1" className="star" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 1 2.8 7.2L22 11l-7.2 2.8L12 21l-2.8-7.2L2 11l7.2-2.8L12 1Z" /></svg>
          <svg id="star-2" className="star" viewBox="0 0 10 10" aria-hidden="true"><path d="m5 0 1.2 3.3L10 5 6.2 6.2 5 10 3.8 6.2 0 5l3.8-1.7L5 0Z" /></svg>
          <svg id="star-3" className="star" viewBox="0 0 14 14" aria-hidden="true"><path d="m7 0 1.8 4.2L14 7 8.8 8.8 7 14 5.2 8.8 0 7l5.2-2.8L7 0Z" /></svg>
          <svg id="star-4" className="star" viewBox="0 0 22 22" aria-hidden="true"><path d="m11 0 2.5 6.5L20 9l-6.5 2.5L11 18l-2.5-6.5L2 9l6.5-2.5L11 0Z" /></svg>
        </span>
      </span>
    </label>
  );
}
