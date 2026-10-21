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

export function LinkPreview({ href, children, className, style, onClick }: LinkPreviewProps) {
  const tooltipId = useId();
  const { status, result, request, cancel } = useLinkPreview(href);

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
    const { displayName, author, description, iconUrl } = result.data;
    return (
      <div className="link-preview">
        <div className="link-preview-body">
          <div className="link-preview-title">
            {displayName}
            <div className="link-preview-meta link-preview-author">
              by {author}
            </div>
          </div>
          {description && <div className="link-preview-extract">{description}</div>}
          <div className="link-preview-site">
            <a href={href} target='_blank' rel='noreferrer' className='link-preview-url'>oldschool.runescape.wiki</a>
          </div>
        </div>
        {iconUrl && <img className="link-preview-thumb link-preview-thumb-round plugin-hub-preview" src={iconUrl} alt="" />}
      </div>
    );
  }

  return <div className="link-preview link-preview-fallback">Open link ↗</div>;
}
