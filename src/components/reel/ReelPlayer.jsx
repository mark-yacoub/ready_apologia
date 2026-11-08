import { useCallback, useEffect, useRef, useState } from 'react';
import { loadYouTubeIframeApi, PLAYER_STATE } from '../../utils/youtubeIframeApi.js';
import '../../styles/reel.css';

/**
 * Full-screen reel: plays a queue of YouTube Shorts one after another in ONE YouTube player.
 * Mounted only by reelController.openReel() after a tap, so the first clip may start with sound.
 *
 * Controls: ▲/▼ buttons, swipe up/down (touch), ↑/↓ PageUp/PageDown, Space/K (play/pause), Esc.
 * Clips that fail to play (removed, private, embedding disabled: codes 2/5/100/101/150) are skipped.
 *
 * @param {{
 *   items: Array<{ videoId: string, apologistName?: string, verseLabel?: string, verseHref?: string, originalUrl?: string }>,
 *   startIndex?: number,
 *   onIndexChange?: (index: number) => void,
 *   onRequestClose: () => void,
 * }} props
 */
export default function ReelPlayer({ items, startIndex = 0, onIndexChange, onRequestClose }) {
  const total = items.length;
  const [index, setIndex] = useState(startIndex);
  /** loading | ready | apiError | ended | allFailed */
  const [status, setStatus] = useState('loading');
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [notice, setNotice] = useState('');
  const coarsePointer = useMediaQuery('(pointer: coarse)');

  const dialogRef = useRef(null);
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const readyRef = useRef(false);
  const loadedIdRef = useRef(null);
  const indexRef = useRef(startIndex);
  const dirRef = useRef(1);
  const failedRef = useRef(new Set());
  const pointerRef = useRef(null);
  const wheelAtRef = useRef(0);

  /** Moves to the nearest playable clip in `dir`; returns false at either end of the queue. */
  const step = useCallback((dir) => {
    let i = indexRef.current + dir;
    while (i >= 0 && i < total && failedRef.current.has(i)) i += dir;
    if (i < 0 || i >= total) return false;
    dirRef.current = dir;
    indexRef.current = i;
    setIndex(i);
    setStatus((s) => (s === 'ended' ? 'ready' : s));
    return true;
  }, [total]);

  const restart = useCallback(() => {
    indexRef.current = -1;
    if (!step(1)) setStatus('allFailed');
  }, [step]);

  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p || !readyRef.current) return;
    if (status === 'ended') { restart(); return; }
    if (p.getPlayerState?.() === PLAYER_STATE.PLAYING) p.pauseVideo();
    else p.playVideo();
  }, [status, restart]);

  // Latest handlers for the YouTube callbacks, which are bound once.
  const handlers = useRef({});
  handlers.current = {
    onState(state) {
      if (state === PLAYER_STATE.PLAYING) {
        setPlaying(true);
        setStarted(true);
        setNotice('');
      } else if (state === PLAYER_STATE.PAUSED || state === PLAYER_STATE.CUED) {
        setPlaying(false);
      } else if (state === PLAYER_STATE.ENDED) {
        setPlaying(false);
        dirRef.current = 1;
        if (!step(1)) setStatus('ended');
      }
    },
    onError() {
      failedRef.current.add(indexRef.current);
      if (failedRef.current.size >= total) {
        setStatus('allFailed');
        return;
      }
      setNotice('Skipped a video that can’t be played here.');
      if (!step(dirRef.current) && !step(-dirRef.current)) setStatus('allFailed');
    },
  };

  // Create the one player (after the lazy API load); destroy it on close.
  useEffect(() => {
    let cancelled = false;
    loadYouTubeIframeApi()
      .then((YT) => {
        if (cancelled || !hostRef.current) return;
        const mount = document.createElement('div');
        hostRef.current.appendChild(mount);
        const firstId = items[indexRef.current].videoId;
        loadedIdRef.current = firstId;
        playerRef.current = new YT.Player(mount, {
          width: '100%',
          height: '100%',
          videoId: firstId,
          playerVars: { autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1, iv_load_policy: 3, origin: location.origin },
          events: {
            onReady: (e) => {
              if (cancelled) return;
              readyRef.current = true;
              setStatus((s) => (s === 'loading' ? 'ready' : s));
              const wanted = items[indexRef.current].videoId;
              if (loadedIdRef.current !== wanted) {
                loadedIdRef.current = wanted;
                e.target.loadVideoById(wanted);
              } else {
                e.target.playVideo();
              }
            },
            onStateChange: (e) => !cancelled && handlers.current.onState(e.data),
            onError: () => !cancelled && handlers.current.onError(),
          },
        });
        const iframe = playerRef.current.getIframe?.();
        if (iframe) iframe.setAttribute('title', 'YouTube video player');
      })
      .catch(() => { if (!cancelled) setStatus('apiError'); });
    return () => {
      cancelled = true;
      readyRef.current = false;
      try { playerRef.current?.destroy(); } catch { /* iframe already removed */ }
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The Shorts embed sometimes loops a clip back to 0:00 instead of reporting ENDED. While playing,
  // watch the clock: a jump from the last 2 s back to the start counts as the end.
  useEffect(() => {
    if (!playing) return undefined;
    let lastT = 0;
    const timer = setInterval(() => {
      const p = playerRef.current;
      if (!p || !readyRef.current || typeof p.getCurrentTime !== 'function') return;
      const t = p.getCurrentTime();
      const d = p.getDuration();
      if (d > 3 && lastT > d - 2 && t < lastT - 1) {
        lastT = 0;
        handlers.current.onState(PLAYER_STATE.ENDED);
        return;
      }
      lastT = t;
    }, 400);
    return () => clearInterval(timer);
  }, [playing, index]);

  // Load the current clip into the same player.
  useEffect(() => {
    onIndexChange?.(index);
    const id = items[index].videoId;
    const p = playerRef.current;
    if (p && readyRef.current && loadedIdRef.current !== id) {
      loadedIdRef.current = id;
      p.loadVideoById(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    dialogRef.current?.focus({ preventScroll: true });
  }, []);

  const onKeyDown = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    switch (e.key) {
      case 'ArrowDown':
      case 'PageDown':
        e.preventDefault();
        step(1);
        break;
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        step(-1);
        break;
      case ' ':
      case 'Spacebar':
      case 'k':
      case 'K':
        e.preventDefault();
        togglePlay();
        break;
      case 'Escape':
        e.preventDefault();
        onRequestClose();
        break;
      case 'Tab':
        trapFocus(e, dialogRef.current);
        break;
      default:
    }
  };

  // Swipe up = next, swipe down = previous (touch/pen). A tap on the gesture layer toggles playback.
  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse') return;
    pointerRef.current = { x: e.clientX, y: e.clientY, t: e.timeStamp };
  };
  const onPointerUp = (e) => {
    const start = pointerRef.current;
    pointerRef.current = null;
    if (!start || e.pointerType === 'mouse') return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dy) > 48 && Math.abs(dy) > Math.abs(dx) * 1.2) {
      step(dy < 0 ? 1 : -1);
    } else if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && e.target.classList?.contains('reel-gesture')) {
      togglePlay();
    }
  };
  const onWheel = (e) => {
    if (Math.abs(e.deltaY) < 30 || e.timeStamp - wheelAtRef.current < 700) return;
    wheelAtRef.current = e.timeStamp;
    step(e.deltaY > 0 ? 1 : -1);
  };

  const item = items[index];
  const hasPrev = index > 0;
  const hasNext = index < total - 1;
  // On touch screens, once a clip has started, a transparent layer over the video takes swipes and
  // taps (the iframe would swallow them). Before that the reader can tap YouTube's own play button.
  const gestureLayer = coarsePointer && started && status === 'ready';
  const youtubeUrl = `https://www.youtube.com/shorts/${item.videoId}`;
  const spoken = [
    `Video ${index + 1} of ${total}`,
    item.apologistName,
    item.verseLabel,
  ].filter(Boolean).join(', ');

  return (
    <div
      ref={dialogRef}
      className="reel-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Video player"
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { pointerRef.current = null; }}
      onWheel={onWheel}
    >
      <div className="reel-topbar">
        <button type="button" className="reel-icon-btn" onClick={onRequestClose} aria-label="Close player">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <p className="reel-counter" aria-hidden="true">
          {index + 1} / {total}
        </p>
      </div>

      <div className="reel-stage">
        <div className="reel-frame">
          <div className="reel-host" ref={hostRef} />
          {status === 'loading' && <p className="reel-status" role="status">Loading video…</p>}
          {status === 'apiError' && (
            <div className="reel-status">
              <p>The YouTube player couldn’t load. Check your connection, or watch this clip on YouTube.</p>
              <a className="reel-text-btn" href={youtubeUrl} target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a>
            </div>
          )}
          {status === 'ended' && (
            <div className="reel-status">
              <p>That’s all {total} videos.</p>
              <div className="reel-status-actions">
                <button type="button" className="reel-text-btn" onClick={restart}>Watch again</button>
                <button type="button" className="reel-text-btn reel-text-btn--ghost" onClick={onRequestClose}>Close</button>
              </div>
            </div>
          )}
          {status === 'allFailed' && (
            <div className="reel-status">
              <p>None of these videos can be played here.</p>
              <a className="reel-text-btn" href={youtubeUrl} target="_blank" rel="noopener noreferrer">Try on YouTube ↗</a>
            </div>
          )}
          {gestureLayer && <div className="reel-gesture" aria-hidden="true" />}
        </div>
      </div>

      <div className="reel-nav" role="group" aria-label="Video controls">
        <button type="button" className="reel-icon-btn" onClick={() => step(-1)} disabled={!hasPrev} aria-label="Previous video">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 15l6-6 6 6" />
          </svg>
        </button>
        <button
          type="button"
          className="reel-icon-btn"
          onClick={togglePlay}
          disabled={status !== 'ready' && status !== 'ended'}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 001.5.86l10.5-6.5a1 1 0 000-1.72L9.5 4.64A1 1 0 008 5.5z" /></svg>
          )}
        </button>
        <button type="button" className="reel-icon-btn" onClick={() => step(1)} disabled={!hasNext} aria-label="Next video">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      <div className="reel-caption" key={index}>
        <p className="reel-caption-line">
          {item.apologistName && <span className="reel-caption-name">{item.apologistName}</span>}
          {item.apologistName && item.verseLabel && <span aria-hidden="true"> · </span>}
          {item.verseLabel && (item.verseHref
            ? <a className="reel-caption-verse" href={item.verseHref}>{item.verseLabel}</a>
            : <span className="reel-caption-verse">{item.verseLabel}</span>)}
        </p>
        <p className="reel-caption-links">
          {item.originalUrl && (
            <a href={item.originalUrl} target="_blank" rel="noopener noreferrer">Full video ↗</a>
          )}
          <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">YouTube ↗</a>
        </p>
      </div>

      <p className="sr-only" aria-live="polite">{notice ? `${notice} ${spoken}` : spoken}</p>
    </div>
  );
}

/** Keeps Tab/Shift+Tab inside the dialog (the rest of the page is also `inert`). */
function trapFocus(e, root) {
  if (!root) return;
  const focusables = Array.from(
    root.querySelectorAll('a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'),
  ).filter((el) => el.getClientRects().length > 0);
  if (!focusables.length) {
    e.preventDefault();
    return;
  }
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;
  if (e.shiftKey && (active === first || active === root)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [query]);
  return matches;
}
