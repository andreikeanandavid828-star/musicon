export default function LoginButton() {
  const handleClick = () => {
    alert("Login button clicked!");
  };

  return (
    <button onClick={handleClick} className="Login-btn">
    </button>
  );
}