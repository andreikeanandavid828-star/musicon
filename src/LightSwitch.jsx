import Button from './Button.jsx';

export default function LightSwitch({ toggleTheme, isDarkMode }) {
  return (
    <Button onClick={toggleTheme} aria-pressed={isDarkMode}>
      {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </Button>
  );
}
