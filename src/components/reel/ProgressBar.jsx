import { useEffect, useRef, useState } from 'react';
import { PLAYER_STATE } from '../../utils/youtubeIframeApi.js';

/** Minimum gap between live seeks while the bar is dragged. */
const SEEK_THROTTLE_MS = 120;
/** Presses this far (px) right of the track land on the time label and are ignored. */
const TRACK_SLACK_PX = 12;

/** `m:ss`. */
export function formatTime(s) {
  const v = Math.max(0, Math.floor(Number(s) || 0));
  return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`;
}

/**
 * Draggable seek bar (WAI-ARIA slider) with an always-visible `elapsed / total` label beside it.
 *
 * Dragging pauses the clip, seeks live (throttled), and resumes it on release if it was playing.
 * Positions map against the track itself, not the label. ←/→ are handled by the dialog; Home/End here.
 * While the duration is unknown the bar is inert and the label shows the elapsed time only.
 *
 * @param {{
 *   getPlayer: () => any,
 *   progress: { t: number, d: number },
 *   seekTo: (t: number) => void,
 *   onScrubbingChange: (scrubbing: boolean) => void,
 * }} props
 */
export default function ProgressBar({ getPlayer, progress, seekTo, onScrubbingChange }) {
  const [scrubT, setScrubT] = useState(null);
  const trackRef = useRef(null);
  /** @type {{ current: null | { pointerId: number, rect: DOMRect, d: number, wasPlaying: boolean, lastSeek: number, t: number } }} */
  const scrubRef = useRef(null);
  const changeRef = useRef(onScrubbingChange);
  changeRef.current = onScrubbingChange;

  // Unmounted mid-drag (clip changed, reel closed): don't leave the parent thinking we still scrub.
  useEffect(() => () => { if (scrubRef.current) changeRef.current(false); }, []);

  const timeAt = (clientX, s) => Math.min(1, Math.max(0, (clientX - s.rect.left) / (s.rect.width || 1))) * s.d;

  const onPointerDown = (e) => {
    if (e.button !== 0 || scrubRef.current) return;
    const p = getPlayer();
    const track = trackRef.current;
    if (!p || !track || typeof p.getDuration !== 'function') return;
    const d = p.getDuration() || progress.d;
    if (!d) return;
    const rect = track.getBoundingClientRect();
    if (e.clientX > rect.right + TRACK_SLACK_PX) return; // on the time label
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const state = p.getPlayerState?.();
    const s = {
      pointerId: e.pointerId,
      rect,
      d,
      wasPlaying: state === PLAYER_STATE.PLAYING || state === PLAYER_STATE.BUFFERING,
      lastSeek: performance.now(),
      t: 0,
    };
    s.t = timeAt(e.clientX, s);
    scrubRef.current = s;
    changeRef.current(true);
    if (s.wasPlaying) p.pauseVideo();
    p.seekTo(s.t, true);
    setScrubT(s.t);
  };

  const onPointerMove = (e) => {
    const s = scrubRef.current;
    if (!s || e.pointerId !== s.pointerId) return;
    e.preventDefault();
    s.t = timeAt(e.clientX, s);
    setScrubT(s.t);
    const now = performance.now();
    if (now - s.lastSeek >= SEEK_THROTTLE_MS) {
      s.lastSeek = now;
      getPlayer()?.seekTo(s.t, false);
    }
  };

  const endScrub = (e, commit) => {
    const s = scrubRef.current;
    if (!s || e.pointerId !== s.pointerId) return;
    scrubRef.current = null;
    if (commit) s.t = timeAt(e.clientX, s);
    setScrubT(null);
    changeRef.current(false);
    seekTo(s.t);
    if (s.wasPlaying) getPlayer()?.playVideo();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Home') {
      e.preventDefault();
      e.stopPropagation();
      seekTo(0);
    } else if (e.key === 'End' && progress.d) {
      e.preventDefault();
      e.stopPropagation();
      seekTo(progress.d - 0.5);
    }
  };

  const scrubbing = scrubT != null;
  const t = scrubbing ? scrubT : progress.t;
  const d = progress.d;
  const frac = d ? Math.min(1, t / d) : 0;
  const label = d ? `${formatTime(t)} / ${formatTime(d)}` : formatTime(t);

  return (
    <div
      className={`reel-progress${scrubbing ? ' is-scrubbing' : ''}`}
      role="slider"
      tabIndex={0}
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={Math.round(d)}
      aria-valuenow={Math.round(Math.min(t, d || t))}
      aria-valuetext={d ? `${formatTime(t)} of ${formatTime(d)}` : formatTime(t)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => endScrub(e, true)}
      onPointerCancel={(e) => endScrub(e, false)}
      onLostPointerCapture={(e) => endScrub(e, false)}
      onKeyDown={onKeyDown}
    >
      {scrubbing && <span className="reel-progress-label" aria-hidden="true">{label}</span>}
      <span className="reel-progress-track" ref={trackRef} aria-hidden="true">
        <span className="reel-progress-fill" style={{ transform: `scaleX(${frac})` }} />
        <span className="reel-progress-thumb" style={{ left: `${frac * 100}%` }} />
      </span>
      <span className="reel-progress-time" aria-hidden="true">{label}</span>
    </div>
  );
}
