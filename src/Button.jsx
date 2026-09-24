export default function Button({ children, className = '', type = 'button', ...props }) {
  return (
    <button className={['button', className].filter(Boolean).join(' ')} type={type} {...props}>
      {children}
    </button>
  );
}
