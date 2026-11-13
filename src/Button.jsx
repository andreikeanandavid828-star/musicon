/**
 * Module: Shared Button
 * Design name: Reusable themed button component
 * Code date: 2026-11-12.
 * Programmer: Mariam Shah
 *
 * Purpose:
 *   Renders a standard button using the shared `button` style and forwards
 *   native button attributes.
 *
 * Important functions:
 *   Button({ children, className, type, ...props }) -> React element:
 *     accepts button content, optional additional CSS class, native button
 *     type, and other button properties; returns a styled button element.
 *
 * Important data structures:
 *   `props` is the remaining native button-prop object; class names are
 *   combined into a string.
 *
 * Algorithms and design choices:
 *   A class-name array is filtered before joining so an omitted optional
 *   class does not create an invalid class token.
 */

export default function Button({ children, className = '', type = 'button', ...props }) {
  return (
    <button className={['button', className].filter(Boolean).join(' ')} type={type} {...props}>
      {children}
    </button>
  );
}
