import { openReel, preloadReel } from './reelController.js';
import '../../styles/reel.css';

/**
 * "▶ Play all (N)" — opens the full-screen reel on tap. Renders nothing below `minItems` clips.
 * Nothing loads from YouTube until it is pressed.
 *
 * @param {{
 *   items: Array<{ videoId: string, apologistName?: string, verseLabel?: string, verseHref?: string, originalUrl?: string }>,
 *   startIndex?: number,
 *   label?: string,
 *   minItems?: number,
 *   className?: string,
 *   findCard?: (videoId: string) => Element | null,
 * }} props
 */
export default function PlayAllButton({ items = [], startIndex = 0, label = 'Play all', minItems = 2, className = '', findCard }) {
  if (!Array.isArray(items) || items.length < minItems) return null;
  const n = items.length;
  return (
    <button
      type="button"
      className={`reel-play-all${className ? ` ${className}` : ''}`}
      aria-haspopup="dialog"
      aria-label={`${label}, ${n} videos`}
      onPointerDown={preloadReel}
      onClick={(e) => openReel(items, startIndex, { opener: e.currentTarget, findCard })}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8 5.5v13a1 1 0 001.5.86l10.5-6.5a1 1 0 000-1.72L9.5 4.64A1 1 0 008 5.5z" />
      </svg>
      <span>{label}</span>
      <span className="reel-play-all-count">· {n}</span>
    </button>
  );
}
