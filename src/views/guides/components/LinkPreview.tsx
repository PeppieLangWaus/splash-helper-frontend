import { useId, useState } from 'react';
import type { CSSProperties, MouseEventHandler, ReactNode, SyntheticEvent } from 'react';
import { Tooltip } from 'react-tooltip';
import { useLinkPreview } from '../hooks/useLinkPreview';
import type { LinkPreviewResult } from '../../../types/linkPreview';
import '../style/LinkPreview.css';

interface LinkPreviewProps {
  href: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

/**
 * A link that grows a Discord-style hover preview once the backend resolves it — see
 * useLinkPreview.ts and splash-helper-backend's routes/linkPreview.ts. Only OSRS Wiki
 * articles, Discord invite links, and RuneLite Plugin Hub links actually resolve to anything
 * (the backend's own domain allowlist decides that, not this component); any other href still
 * renders as a plain working link, just with a minimal "Open link" tooltip instead of a real
 * preview.
 *
 * Replaces the old hand-paired `<Tooltip id="x-wiki" content="...">` + `<a data-tooltip-id="x-wiki">`
 * boilerplate every wiki-linked guide used to write out by hand (see views/guides/PickpocketGuide.tsx's
 * `tooltip` object) — the id is generated internally and the content is fetched, not hand-written.
 */
export function LinkPreview({ href, children, className, style, onClick }: LinkPreviewProps) {
  const tooltipId = useId();
  const { status, result, request, cancel } = useLinkPreview(href);
  // Set once the thumbnail's natural dimensions are known (see handleThumbLoad below) — landscape
  // images lay out as image-on-top/text-below instead of the default text-left/image-right, so a
  // wide screenshot doesn't get squeezed into a tall, narrow strip alongside the text.
  const [wideThumb, setWideThumb] = useState(false);

  const handleThumbLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setWideThumb(img.naturalWidth > img.naturalHeight);
  };

  return (
    <>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={style}
        data-tooltip-id={tooltipId}
        onMouseEnter={request}
        onFocus={request}
        onMouseLeave={cancel}
        onBlur={cancel}
        onClick={onClick}
      >
        {children}
      </a>
      <Tooltip
        id={tooltipId}
        disableStyleInjection
        place="top"
        opacity={1}
        portalRoot={document.body}
        delayShow={150}
        clickable
        className={wideThumb ? 'link-preview-tooltip link-preview-tooltip-wide' : 'link-preview-tooltip'}
        border="1px solid var(--border-strong)"
        // `render` (rather than children) is what wires up react-tooltip's internal
        // ResizeObserver-based reposition — see contentWrapperRef in react-tooltip's source: it's
        // only ever attached to a DOM node along the `render`/`content` prop path, never for plain
        // children. Without it, the tooltip's position is computed once against whatever content
        // is in it at that instant (typically the "Loading preview…" placeholder) and never
        // recomputed as the real preview loads in and grows the box — which is why the first
        // hover on a link lands the tooltip in the wrong place while a second (cached, so already
        // full-size by the time it's positioned) hover lands correctly.
        render={() => (
          <LinkPreviewContent href={href} status={status} result={result} wideThumb={wideThumb} onThumbLoad={handleThumbLoad} />
        )}
      />
    </>
  );
}

function LinkPreviewContent({
  href,
  status,
  result,
  wideThumb,
  onThumbLoad,
}: {
  href: string,
  status: 'idle' | 'loading' | 'ready' | 'error';
  result?: LinkPreviewResult;
  wideThumb: boolean;
  onThumbLoad: (e: SyntheticEvent<HTMLImageElement>) => void;
}) {
  if (status !== 'ready' || !result) {
    return <div className="link-preview link-preview-loading">Loading preview…</div>;
  }

  if (result.type === 'wiki' && result.found) {
    const { title, extract, thumbnailUrl } = result.data;
    return (
      <div className={wideThumb ? 'link-preview link-preview-wide' : 'link-preview'}>
        <div className="link-preview-body">
          <div className="link-preview-title">{title}</div>
          {extract && <div className="link-preview-extract">{extract}</div>}
          <div className="link-preview-site">
            <a href={href} target='_blank' rel='noreferrer' className='link-preview-url'>oldschool.runescape.wiki</a>
          </div>
        </div>
        {thumbnailUrl && (
          <div className="link-preview-thumb">
            <img src={thumbnailUrl} alt="" onLoad={onThumbLoad} />
          </div>
        )}
      </div>
    );
  }

  if (result.type === 'discord-invite' && result.found) {
    const { guildName, guildIconUrl, description, memberCount, onlineCount } = result.data;
    return (
      <div className="link-preview">
        <div className="link-preview-body">
          <div className="link-preview-title">{guildName}</div>
          {description && <div className="link-preview-extract">{description}</div>}
          {typeof memberCount === 'number' && (
            <div className="link-preview-meta">
              {typeof onlineCount === 'number' && (
                <>
                  <span className="link-preview-online-dot" />
                  {onlineCount.toLocaleString()} online ·{' '}
                </>
              )}
              {memberCount.toLocaleString()} members
            </div>
          )}
        </div>
        {guildIconUrl && <img className="link-preview-thumb link-preview-thumb-round" src={guildIconUrl} alt="" />}
      </div>
    );
  }

  if (result.type === 'plugin-hub' && result.found) {
    const { displayName, author, description, iconUrl, stars } = result.data;
    return (
      <div className="link-preview">
        <div className="link-preview-body">
          <div className="link-preview-title">{displayName}</div>
          {description && <div className="link-preview-extract">{description}</div>}
          <div className="link-preview-meta">
            by {author}
            {typeof stars === 'number' && (
              <>
                {' · '}
                <span className="link-preview-star">★</span> {stars.toLocaleString()}
              </>
            )}
          </div>
        </div>
        {iconUrl && <img className="link-preview-thumb link-preview-thumb-round" src={iconUrl} alt="" />}
      </div>
    );
  }

  // "not found" (missing wiki page, invalid/revoked invite, unknown or disabled plugin) or an
  // unsupported domain — no real preview data, so fall back to a minimal cue rather than an
  // empty-looking box.
  return <div className="link-preview link-preview-fallback">Open link ↗</div>;
}
