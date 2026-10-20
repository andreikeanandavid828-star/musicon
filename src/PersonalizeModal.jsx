import { useEffect, useRef } from 'react';
import Button from './Button.jsx';
import {
  PALETTES, DEFAULT_PALETTE, DEFAULT_MODE,
} from './Appearance.js';
import './PersonalizeModal.css';

export default function PersonalizeModal({
  onClose,
  paletteId,
  defaultMode,
  currentMode,
  onPaletteChange,
  onDefaultModeChange,
}) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    if (!dialog) return undefined;
    if (!dialog.open) dialog.showModal();
    closeRef.current?.focus();
    return () => {
      if (dialog.open) dialog.close();
      previousFocus?.focus?.();
    };
  }, []);

  function reset() {
    onPaletteChange(DEFAULT_PALETTE);
    onDefaultModeChange(DEFAULT_MODE);
  }

  return (
    <dialog
      ref={dialogRef}
      className="personalize-modal"
      aria-labelledby="personalize-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <header className="personalize-header">
        <div>
          <h2 id="personalize-title">Personalize Musicon</h2>
          <p>Pick your colors and your preferred brightness.</p>
        </div>
        <button
          type="button"
          className="personalize-close"
          ref={closeRef}
          aria-label="Close personalization"
          onClick={onClose}
        >
          ×
        </button>
      </header>

      <section className="personalize-section" aria-labelledby="palette-title">
        <h3 id="palette-title">Color theme</h3>
        <p>Choose a whole color family. Every palette has a light and a dark appearance.</p>
        <div className="personalize-grid">
          {PALETTES.map((palette) => (
            <button
              type="button"
              key={palette.id}
              className={`personalize-palette ${paletteId === palette.id ? 'is-selected' : ''}`}
              aria-pressed={paletteId === palette.id}
              onClick={() => onPaletteChange(palette.id)}
              style={{
                '--sample-deep': palette.colors[0],
                '--sample-dark': palette.colors[1],
                '--sample-middle': palette.colors[2],
                '--sample-soft': palette.colors[3],
                '--sample-pale': palette.colors[4],
              }}
            >
              <span className="personalize-mini-site" aria-hidden="true">
                <span className="personalize-mini-sidebar" />
                <span className="personalize-mini-content">
                  <span className="personalize-mini-title" />
                  <span className="personalize-mini-card" />
                  <span className="personalize-mini-button" />
                </span>
              </span>
              <span className="personalize-swatches" aria-hidden="true">
                {palette.colors.map((color, index) => (
                  <span key={`${palette.id}-${index}`} style={{ background: color }} />
                ))}
              </span>
              <span className="personalize-palette-name">{palette.name}</span>
              <small>{palette.description}</small>
              {paletteId === palette.id && <span className="personalize-selected">✓ Selected</span>}
            </button>
          ))}
        </div>
      </section>

      <section className="personalize-section" aria-labelledby="brightness-title">
        <h3 id="brightness-title">Default appearance</h3>
        <p>The sidebar light switch still works; it just won't overwrite this preference.</p>
        <div className="personalize-modes" role="group" aria-label="Default appearance">
          {['light', 'dark'].map((mode) => (
            <button
              type="button"
              key={mode}
              className={`personalize-mode ${defaultMode === mode ? 'is-selected' : ''}`}
              aria-pressed={defaultMode === mode}
              onClick={() => onDefaultModeChange(mode)}
            >
              <span aria-hidden="true">{mode === 'light' ? '☀' : '☾'}</span>
              {mode === 'light' ? 'Light' : 'Dark'}
            </button>
          ))}
        </div>
        {currentMode !== defaultMode && (
          <p className="personalize-override-note" role="status">
            You're temporarily viewing {currentMode} mode. Your saved default is {defaultMode}.
          </p>
        )}
      </section>

      <footer className="personalize-footer">
        <span>Changes apply immediately and are saved in this browser.</span>
        <div className="personalize-actions">
          <Button className="button--secondary" onClick={reset}>Reset</Button>
          <Button className="button--primary" onClick={onClose}>Done</Button>
        </div>
      </footer>
    </dialog>
  );
}
