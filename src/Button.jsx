/**
 * @fileoverview Provides a shared button with consistent styling and native
 * button attributes.
 * @module Button
 * @author Mariam, Ian
 * @date 2026-09-23
 */

/**
 * Renders the shared button style while forwarding standard button props.
 *
 * @param {Object} props - Button content, styling, type, and native attributes.
 * @param {React.ReactNode} props.children - Content displayed inside the button.
 * @param {string} [props.className=''] - Additional CSS classes.
 * @param {'button' | 'submit' | 'reset'} [props.type='button'] - Native button type.
 * @returns {React.JSX.Element} A styled HTML button.
 */
export default function Button({ children, className = '', type = 'button', ...props }) {
  return (
    <button className={['button', className].filter(Boolean).join(' ')} type={type} {...props}>
      {children}
    </button>
  );
}
