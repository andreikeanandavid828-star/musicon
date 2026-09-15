// This is a button for the light switch component
export default function LightSwitch({ toggleTheme, isDarkMode }) {
  return (
    <button onClick={toggleTheme} className="theme-toggle-btn">
      {/* Change the text or emoji on the button based on the mode */}
      {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  );
}
