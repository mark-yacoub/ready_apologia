import { memo, useEffect, useRef, useState } from 'react';
import { PLAYER_STATE } from '../../utils/youtubeIframeApi.js';
import useYouTubePlayer from './useYouTubePlayer.js';
import useFeedScroll from './useFeedScroll.js';
import ProgressBar from './ProgressBar.jsx';
import { ChevronIcon, CloseIcon, MutedIcon, PauseIcon, PlayIcon } from './icons.jsx';
import '../../styles/reel.css';

/** Slides within this distance of the active one render their thumbnail and caption. */
const WINDOW = 3;
/** If a clip has not started by then (autoplay with sound blocked), retry it muted. */
const AUTOPLAY_FALLBACK_MS = 2000;
/** After a seek, show the target time until getCurrentTime catches up (or this long passes). */
const SEEK_HOLD_MS = 1500;
/** Progress poll / loop-back watchdog period. */
const POLL_MS = 250;

const thumbUrl = (id) => `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;
const youtubeUrlOf = (id) => `https://www.youtube.com/shorts/${encodeURIComponent(id)}`;
const isPlayingState = (s) => s === PLAYER_STATE.PLAYING || s === PLAYER_STATE.BUFFERING;

/**
 * Full-screen reel shown as a native vertical feed (like Shorts / TikTok).
 *
 * - The feed (useFeedScroll) is a scroll-snap scroller with one full-height slide per clip, so a
 *   swipe, trackpad or wheel drags the current clip up and the next one in, with the browser's own
 *   momentum and snap. Only slides near the active one render content.
 * - ONE YouTube player (useYouTubePlayer) lives in a layer positioned over the active slide inside
 *   the scroller, so it moves with the finger like the rest of the feed. When a new slide settles,
 *   the layer moves there (no reparenting, so the iframe is not reloaded) and the next clip is loaded
 *   into it. Reusing one player keeps sound working on iOS after the first tap.
 * - YouTube's chrome is hidden; a transparent layer handles taps (play/pause) and lets vertical drags
 *   scroll the feed; a draggable progress bar seeks.
 * - Autoplay advances to the next playable clip on end, but never while the reader is scrolling.
 *
 * Keys: ↑/↓ PageUp/PageDown (previous/next), Space/K (play/pause), ←/→ (−/+5 s), Esc (close).
 * Clips that fail to play are skipped in the direction of travel.
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
  const [active, setActive] = useState(startIndex);
  /** Slide nearest the viewport while scrolling (for the counter). */
  const [shownIndex, setShownIndex] = useState(startIndex);
  /** loading | ready | apiError | ended | allFailed */
  const [status, setStatus] = useState('loading');
  const [playing, setPlaying] = useState(false);
  /** The iframe is revealed once the active clip is actually playing; the thumbnail shows until then. */
  const [revealed, setRevealed] = useState(false);
  const [muted, setMuted] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [failed, setFailed] = useState(() => new Set());
  const [flash, setFlash] = useState(null);
  const [notice, setNotice] = useState('');
  const [progress, setProgress] = useState({ t: 0, d: 0 });
  const [scrubbing, setScrubbing] = useState(false);

  const dialogRef = useRef(null);
  const feedRef = useRef(null);
  const hostRef = useRef(null);
  // Mirrors of state read by callbacks bound once (player events, timers, scroll listeners).
  const activeRef = useRef(startIndex);
  const failedRef = useRef(failed);
  const mutedRef = useRef(false);
  const userPausedRef = useRef(false);
  const scrubbingRef = useRef(false);
  /** Direction of travel (+1 / −1): failed clips are skipped this way. */
  const dirRef = useRef(1);
  /** The clip ended while the reader was scrolling; advance once the feed settles back on it. */
  const endedWhileBusyRef = useRef(false);
  const autoplayTimerRef = useRef(0);
  /** { t, until } after a seek, until getCurrentTime catches up. */
  const seekHoldRef = useRef(null);
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const { scrollToIndex, pendingRef, isInteracting } = useFeedScroll(feedRef, {
    total,
    startIndex,
    activeRef,
    reduceMotion,
    onScrollIndex: setShownIndex,
    onSettle: activate,
    onWheelStep: step,
  });

  const { getPlayer, loadVideo, loadedIdRef } = useYouTubePlayer(hostRef, {
    getInitialVideoId: () => items[activeRef.current].videoId,
    onReady(player) {
      setStatus((s) => (s === 'loading' ? 'ready' : s));
      const wanted = items[activeRef.current].videoId;
      if (loadedIdRef.current !== wanted) loadVideo(wanted);
      else player.playVideo();
      armAutoplayFallback();
    },
    onStateChange: onPlayerState,
    onError: onPlayerError,
    onFail: () => setStatus('apiError'),
  });

  // ---------- Navigation (always by scrolling the feed) ----------

  /** Nearest playable index from `from` in `dir`, or -1. */
  function findPlayable(from, dir) {
    let i = from + dir;
    while (i >= 0 && i < total && failedRef.current.has(i)) i += dir;
    return i >= 0 && i < total ? i : -1;
  }

  /** Moves one clip in `dir`; returns false at either end of the queue. */
  function step(dir) {
    const i = findPlayable(pendingRef.current ?? activeRef.current, dir);
    if (i < 0) return false;
    dirRef.current = dir;
    scrollToIndex(i);
    return true;
  }

  /** The feed came to rest on slide `i`. */
  function activate(i) {
    if (i === activeRef.current) {
      if (endedWhileBusyRef.current) onClipEnded();
      return;
    }
    dirRef.current = i > activeRef.current ? 1 : -1;
    activeRef.current = i;
    setActive(i);
  }

  function restart() {
    const i = findPlayable(-1, 1);
    if (i < 0) { setStatus('allFailed'); return; }
    setStatus('ready');
    if (i === activeRef.current) {
      const p = getPlayer();
      p?.seekTo(0, true);
      p?.playVideo();
    } else {
      dirRef.current = 1;
      scrollToIndex(i);
    }
  }

  // ---------- Playback ----------

  const showFlash = (kind) => setFlash({ kind, key: Date.now() });
  const setUserPausedBoth = (v) => { userPausedRef.current = v; setUserPaused(v); };
  const setMutedBoth = (v) => { mutedRef.current = v; setMuted(v); };
  const setScrubbingBoth = (v) => { scrubbingRef.current = v; setScrubbing(v); };

  /** Whether `player` currently holds the active clip (or cannot tell). */
  function holdsActiveClip(player) {
    const vid = player?.getVideoData?.()?.video_id;
    return !vid || vid === items[activeRef.current].videoId;
  }

  function togglePlay() {
    if (status === 'ended') { restart(); return; }
    const p = getPlayer();
    if (!p) return;
    if (isPlayingState(p.getPlayerState?.())) {
      p.pauseVideo();
      setUserPausedBoth(true);
      showFlash('pause');
    } else {
      p.playVideo();
      setUserPausedBoth(false);
      showFlash('play');
    }
  }

  function unmute() {
    const p = getPlayer();
    if (!p) return;
    p.unMute?.();
    p.setVolume?.(100);
    if (p.getPlayerState?.() !== PLAYER_STATE.PLAYING) p.playVideo?.();
    setMutedBoth(false);
  }

  /** Seeks to `target` seconds (clamped just short of the end) and holds the bar there. */
  function seekTo(target) {
    const p = getPlayer();
    if (!p || typeof p.getDuration !== 'function') return;
    const d = p.getDuration() || 0;
    const t = Math.max(0, d ? Math.min(d - 0.25, target) : target);
    p.seekTo(t, true);
    seekHoldRef.current = { t, until: Date.now() + SEEK_HOLD_MS };
    setProgress({ t, d });
  }

  function seekBy(delta) {
    const p = getPlayer();
    if (p && typeof p.getCurrentTime === 'function') seekTo((p.getCurrentTime() || 0) + delta);
  }

  function armAutoplayFallback() {
    clearTimeout(autoplayTimerRef.current);
    autoplayTimerRef.current = window.setTimeout(() => {
      const p = getPlayer();
      if (!p || mutedRef.current || userPausedRef.current) return;
      const s = p.getPlayerState?.();
      if (isPlayingState(s) || s === PLAYER_STATE.ENDED) return;
      p.mute?.();
      p.playVideo?.();
      setMutedBoth(true);
    }, AUTOPLAY_FALLBACK_MS);
  }

  /** The active clip finished (ENDED, or the loop-back watchdog): advance unless the reader is busy. */
  function onClipEnded() {
    endedWhileBusyRef.current = false;
    setPlaying(false);
    const p = getPlayer();
    // The Shorts embed may loop instead of stopping: silence it before moving on.
    if (isPlayingState(p?.getPlayerState?.())) p.pauseVideo();
    const next = findPlayable(activeRef.current, 1);
    if (next < 0) { setStatus('ended'); return; }
    if (isInteracting()) { endedWhileBusyRef.current = true; return; } // don't fight the reader's scroll
    setRevealed(false);
    dirRef.current = 1;
    scrollToIndex(next);
  }

  function onPlayerState(state, player) {
    if (state === PLAYER_STATE.PLAYING) {
      if (!holdsActiveClip(player)) return; // the previous clip, still stopping
      clearTimeout(autoplayTimerRef.current);
      setPlaying(true);
      setRevealed(true);
      setNotice('');
      if (mutedRef.current && player.isMuted && !player.isMuted()) setMutedBoth(false);
    } else if (state === PLAYER_STATE.PAUSED || state === PLAYER_STATE.CUED) {
      setPlaying(false);
    } else if (state === PLAYER_STATE.ENDED) {
      if (holdsActiveClip(player)) onClipEnded();
    }
  }

  function onPlayerError(code, player) {
    const i = activeRef.current;
    if (!holdsActiveClip(player) || failedRef.current.has(i)) return; // stale or repeated error
    console.warn(`[reel] skipping video ${items[i].videoId}: YouTube error ${code}`);
    const nextFailed = new Set(failedRef.current).add(i);
    failedRef.current = nextFailed;
    setFailed(nextFailed);
    setRevealed(false);
    setPlaying(false);
    clearTimeout(autoplayTimerRef.current);
    const dir = dirRef.current;
    const target = findPlayable(i, dir) >= 0 ? findPlayable(i, dir) : findPlayable(i, -dir);
    if (target < 0) { setStatus('allFailed'); return; }
    setNotice('Skipped a video that can’t be played here.');
    scrollToIndex(target);
  }

  // A new slide settled: report it and load its clip into the player.
  useEffect(() => {
    onIndexChange?.(active);
    setShownIndex(active);
    setProgress({ t: 0, d: 0 });
    seekHoldRef.current = null;
    endedWhileBusyRef.current = false;
    setUserPausedBoth(false);
    setStatus((s) => (s === 'ended' ? 'ready' : s));
    const p = getPlayer();
    if (failedRef.current.has(active)) {
      // Landed on a known-bad clip by scrolling: silence the old clip and keep going the same way.
      setRevealed(false);
      if (isPlayingState(p?.getPlayerState?.())) p.pauseVideo();
      const target = findPlayable(active, dirRef.current);
      if (target >= 0) scrollToIndex(target);
      return;
    }
    if (!p) return; // onReady loads the right clip
    setRevealed(false);
    setPlaying(false);
    const id = items[active].videoId;
    if (loadedIdRef.current !== id) loadVideo(id);
    else p.playVideo(); // same clip again (e.g. back from a failed slide that paused it)
    armAutoplayFallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Progress (~4x/s) + the loop-back watchdog: the Shorts embed sometimes loops a clip back to 0:00
  // instead of reporting ENDED; a jump from the last 2 s to under 1 s counts as the end.
  useEffect(() => {
    if (status !== 'ready') return undefined;
    let lastT = 0;
    const timer = setInterval(() => {
      const p = getPlayer();
      if (!p || typeof p.getCurrentTime !== 'function') return;
      const t = p.getCurrentTime() || 0;
      const d = p.getDuration() || 0;
      // A live hold (even on the tick it catches up, e.g. Home from the end) is a seek, not a loop;
      // an expired one must not mask a real loop-back.
      const hold = seekHoldRef.current;
      const seeking = scrubbingRef.current || (hold && Date.now() <= hold.until);
      if (hold && (Math.abs(t - hold.t) < 1 || Date.now() > hold.until)) seekHoldRef.current = null;
      // BUFFERING counts: the loop restarts in BUFFERING at 0:00 for a few hundred ms, and requiring
      // PLAYING let lastT reset to 0 on that tick, so the loop went unnoticed (flaky).
      if (!seeking && d > 3 && lastT > d - 2 && t < 1 && isPlayingState(p.getPlayerState?.())) {
        lastT = 0;
        if (holdsActiveClip(p)) onClipEnded();
        return;
      }
      lastT = t;
      if (seekHoldRef.current) { setProgress({ t: seekHoldRef.current.t, d }); return; }
      setProgress((prev) => (Math.abs(prev.t - t) < 0.05 && prev.d === d ? prev : { t, d }));
    }, POLL_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, active]);

  useEffect(() => () => clearTimeout(autoplayTimerRef.current), []);

  useEffect(() => {
    dialogRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!flash) return undefined;
    const t = setTimeout(() => setFlash(null), 650);
    return () => clearTimeout(t);
  }, [flash]);

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
      case 'ArrowRight':
        e.preventDefault();
        seekBy(5);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        seekBy(-5);
        break;
      case ' ':
      case 'Spacebar':
        // Space on a focused link/button activates it instead.
        if (e.target instanceof HTMLElement && e.target.closest('a, button')) return;
        e.preventDefault();
        togglePlay();
        break;
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

  // ---------- Render ----------
  const item = items[active];
  const hasPrev = findPlayable(active, -1) >= 0;
  const hasNext = findPlayable(active, 1) >= 0;
  const youtubeUrl = youtubeUrlOf(item.videoId);
  const spoken = [`Video ${active + 1} of ${total}`, item.apologistName, item.verseLabel].filter(Boolean).join(', ');
  const paused = status === 'ready' && userPaused && !playing && !scrubbing;

  return (
    <div
      ref={dialogRef}
      className="reel-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Video player"
      tabIndex={-1}
      onKeyDown={onKeyDown}
    >
      <div className="reel-feed" ref={feedRef}>
        {items.map((it, i) => (
          <Slide
            key={`${i}-${it.videoId}`}
            item={it}
            index={i}
            near={Math.abs(i - active) <= WINDOW}
            isActive={i === active}
            failed={failed.has(i)}
          />
        ))}

        {/* The one player, positioned over the active slide; it scrolls with the feed. */}
        <div className="reel-layer" style={{ top: `${active * 100}%` }}>
          <div className="reel-frame reel-frame--player">
            <div className={`reel-host${revealed ? ' is-revealed' : ''}`} ref={hostRef} />
            <div className="reel-tap" aria-hidden="true" onClick={togglePlay} />

            {status === 'loading' && <p className="reel-chip reel-chip--center" role="status">Loading video…</p>}
            {status === 'ready' && !revealed && !userPaused && !failed.has(active) && <span className="reel-spinner" aria-hidden="true" />}
            {paused && <span className="reel-paused-icon" aria-hidden="true"><PlayIcon size={40} /></span>}
            {flash && !paused && (
              <span className="reel-flash" key={flash.key} aria-hidden="true">
                {flash.kind === 'pause' ? <PauseIcon size={34} /> : <PlayIcon size={34} />}
              </span>
            )}
            {muted && status === 'ready' && (
              <button type="button" className="reel-chip reel-chip--sound" onClick={unmute}>
                <MutedIcon />
                Tap for sound
              </button>
            )}

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

            {status === 'ready' && (
              <ProgressBar
                key={active}
                getPlayer={getPlayer}
                progress={progress}
                seekTo={seekTo}
                onScrubbingChange={setScrubbingBoth}
              />
            )}
          </div>
        </div>
      </div>

      <div className="reel-topbar">
        <button type="button" className="reel-icon-btn" onClick={onRequestClose} aria-label="Close player">
          <CloseIcon />
        </button>
        <p className="reel-counter" aria-hidden="true">
          {shownIndex + 1} / {total}
        </p>
      </div>

      <div className="reel-nav" role="group" aria-label="Video controls">
        <button type="button" className="reel-icon-btn" onClick={() => step(-1)} disabled={!hasPrev} aria-label="Previous video">
          <ChevronIcon dir="up" />
        </button>
        <button
          type="button"
          className="reel-icon-btn"
          onClick={togglePlay}
          disabled={status !== 'ready' && status !== 'ended'}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button type="button" className="reel-icon-btn" onClick={() => step(1)} disabled={!hasNext} aria-label="Next video">
          <ChevronIcon dir="down" />
        </button>
      </div>

      <p className="sr-only" aria-live="polite">{notice ? `${notice} ${spoken}` : spoken}</p>
    </div>
  );
}

/** One feed slide: thumbnail + caption (content only near the active slide). Off-screen slides are inert. */
const Slide = memo(function Slide({ item, index, near, isActive, failed }) {
  const youtubeUrl = youtubeUrlOf(item.videoId);
  return (
    <section
      className={`reel-slide${isActive ? ' is-active' : ''}`}
      data-index={index}
      aria-hidden={isActive ? undefined : 'true'}
      // React 18 passes unknown attributes through: '' renders `inert=""`.
      inert={isActive ? undefined : ''}
    >
      {near && (
        <div className="reel-frame">
          <img className="reel-thumb" src={thumbUrl(item.videoId)} alt="" decoding="async" draggable="false" />
          {failed && (
            <div className="reel-status reel-status--soft">
              <p>This video can’t be played here.</p>
              <a className="reel-text-btn" href={youtubeUrl} target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a>
            </div>
          )}
          <div className="reel-caption">
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
        </div>
      )}
    </section>
  );
});

/** Keeps Tab/Shift+Tab inside the dialog (the rest of the page is also `inert`). */
function trapFocus(e, root) {
  if (!root) return;
  const focusables = Array.from(
    root.querySelectorAll('a[href], button:not([disabled]), iframe:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])'),
  ).filter((el) => el.getClientRects().length > 0 && !el.closest('[inert]'));
  if (!focusables.length) {
    e.preventDefault();
    return;
  }
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const current = document.activeElement;
  if (e.shiftKey && (current === first || current === root)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && current === last) {
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
