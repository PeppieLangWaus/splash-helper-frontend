import { useState } from 'react';
import { colors } from '../../../theme';
import Modal from '../../../components/Modal';

const s = {
  figure: { margin: '0 0 1.25rem' },
  frame: {
    width: 'fit-content',
    // border: `1px solid ${colors.border}`,
    borderRadius: 8,
    overflow: 'hidden',
    background: colors.panel,
  },
  img: { display: 'block', width: '100%', height: 'auto' },
  caption: { color: colors.textFaint, fontSize: '0.8rem', lineHeight: 1.5, marginTop: '0.5rem', textAlign: 'center' as const },
  zoomedImg: { display: 'block', maxWidth: '100%', maxHeight: '80vh', borderRadius: 4, cursor: 'zoom-out' },
} as const;

interface Props {
  src: string;
  alt: string;
  caption?: string;
  /** Lets the reader click the image to view an enlarged version in a modal overlay — reuses
   *  the shared `Modal` (bordered panel capped at 90vw/centered, not a true fullscreen takeover).
   *  Off by default; turn on per-image for screenshots worth zooming into. */
  zoomable?: boolean;
  width?: number | string;
  height?: number | string;
}

/** Standard image block for guide pages: bordered frame matching the guide theme, optional
 *  caption, and optional click-to-enlarge. Always set `width`/`height` when known so the layout
 *  doesn't jump as the image loads. */
export default function GuideFigure({ src, alt, caption, zoomable = false, width, height }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <figure style={s.figure}>
      <div style={s.frame}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          style={{
            ...s.img,
            cursor: zoomable ? 'zoom-in' : undefined,
            width: width,
            height: height,
          }}
          onClick={zoomable ? () => setOpen(true) : undefined}
          role={zoomable ? 'button' : undefined}
          tabIndex={zoomable ? 0 : undefined}
          onKeyDown={
            zoomable
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setOpen(true);
                  }
                }
              : undefined
          }
        />
      </div>
      {caption && <figcaption style={s.caption}>{caption}</figcaption>}

      {open && (
        <Modal onClose={() => setOpen(false)}>
          <img src={src} alt={alt} style={s.zoomedImg} onClick={() => setOpen(false)} />
        </Modal>
      )}
    </figure>
  );
}
