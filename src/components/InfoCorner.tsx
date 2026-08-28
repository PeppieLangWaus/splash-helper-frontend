import { useState, type ReactNode } from 'react';
import './InfoCorner.css';

interface Props {
  children: ReactNode;
}

/** Collapsible "what is this page" blurb pinned to the top-left corner of the viewport,
 *  just under the nav bar. Mounted once in App.tsx — the text shown is whatever the
 *  current view passes in, so it reads as page-specific context rather than a fixed panel. */
export default function InfoCorner({ children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`info-corner${open ? ' info-corner--open' : ''}`}>
      <button
        type="button"
        className="info-corner-summary"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <svg
          className="info-corner-chevron"
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path d="M5 2l7 6-7 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        What is this?
      </button>
      <div className="info-corner-collapse">
        <div className="info-corner-collapse-inner">
          <p className="info-corner-text">{children}</p>
        </div>
      </div>
    </div>
  );
}
