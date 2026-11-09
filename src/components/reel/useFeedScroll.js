import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

/** Quiet time after the last scroll event before the feed counts as settled (no `scrollend`). */
const SETTLE_MS = 150;
/** A wheel gesture ends after this long without wheel events. */
const WHEEL_GESTURE_END_MS = 220;
/** Wheel gestures shorter than this (px) never step. */
const WHEEL_MIN_PX = 40;
/** How far (px) the feed may sit from a slide boundary and still count as resting on it. */
const REST_TOLERANCE_PX = 4;

/**
 * Drives the full-height scroll-snap feed: one slide per clip, `startIndex` shown before first paint.
 *
 * - `onScrollIndex(i)` fires on every scroll with the slide nearest the viewport (for the counter).
 * - `onSettle(i)` fires whenever the feed comes to rest on slide `i` (also when it is the same slide,
 *   e.g. after a drag that snapped back).
 * - `scrollToIndex(i)` scrolls there (smoothly unless reduced motion); `pendingRef` holds the target
 *   until it settles, so repeated ↓ presses keep advancing from where the feed is heading.
 * - `isInteracting()` is true while a finger is down, a programmatic scroll is in flight, or the
 *   feed is between slides: autoplay must not scroll then, or it would fight the reader.
 * - Wheel fallback: some wheels send precise pixel deltas with no gesture end, so mandatory snap
 *   pulls every notch back to the current slide. If a wheel gesture ends where it started, it steps
 *   once via `onWheelStep(dir)`. It cannot double-step a gesture the browser already scrolled: it
 *   bails if the feed moved, a slide was activated, or a programmatic scroll is pending.
 *
 * @param {{ current: HTMLElement | null }} feedRef
 * @param {{
 *   total: number,
 *   startIndex: number,
 *   activeRef: { current: number },
 *   reduceMotion: boolean,
 *   onScrollIndex: (i: number) => void,
 *   onSettle: (i: number) => void,
 *   onWheelStep: (dir: 1 | -1) => void,
 * }} options
 */
export default function useFeedScroll(feedRef, { total, startIndex, activeRef, reduceMotion, onScrollIndex, onSettle, onWheelStep }) {
  const pendingRef = useRef(null);
  const touchingRef = useRef(false);
  const reduceRef = useRef(reduceMotion);
  reduceRef.current = reduceMotion;
  const cb = useRef(null);
  cb.current = { onScrollIndex, onSettle, onWheelStep };

  const scrollToIndex = useCallback((i, { instant = false } = {}) => {
    const feed = feedRef.current;
    if (!feed || i < 0 || i >= total) return;
    const top = i * feed.clientHeight;
    if (Math.abs(feed.scrollTop - top) < 1) {
      // Already there: no scroll event will come, so settle now (and never leave pendingRef stuck).
      pendingRef.current = null;
      cb.current.onSettle(i);
      return;
    }
    pendingRef.current = i;
    feed.scrollTo({ top, behavior: instant || reduceRef.current ? 'auto' : 'smooth' });
  }, [feedRef, total]);

  const isInteracting = useCallback(() => {
    const feed = feedRef.current;
    if (!feed) return false;
    if (touchingRef.current || pendingRef.current != null) return true;
    const h = feed.clientHeight;
    return h > 0 && Math.abs(feed.scrollTop - activeRef.current * h) > REST_TOLERANCE_PX;
  }, [feedRef, activeRef]);

  // Start at the requested slide, before the first paint.
  useLayoutEffect(() => {
    const feed = feedRef.current;
    if (feed) feed.scrollTop = startIndex * feed.clientHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return undefined;
    let settleTimer = 0;
    const nearest = () => {
      const h = feed.clientHeight;
      return h ? Math.min(total - 1, Math.max(0, Math.round(feed.scrollTop / h))) : activeRef.current;
    };
    const settle = () => {
      clearTimeout(settleTimer);
      const h = feed.clientHeight;
      if (!h) return;
      const i = nearest();
      if (Math.abs(feed.scrollTop - i * h) > REST_TOLERANCE_PX) return; // between slides (finger held)
      pendingRef.current = null;
      cb.current.onSettle(i);
    };
    const scheduleSettle = () => {
      clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settle, SETTLE_MS);
    };
    const onScroll = () => {
      cb.current.onScrollIndex(nearest());
      scheduleSettle();
    };

    const onTouchStart = () => { touchingRef.current = true; };
    const onTouchEnd = (e) => {
      if (e.touches && e.touches.length) return;
      touchingRef.current = false;
      scheduleSettle(); // a touch that never scrolled still needs a settle (deferred autoplay)
    };

    let wheel = null;
    const onWheel = (e) => {
      if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      if (!wheel) wheel = { from: activeRef.current, sum: 0, timer: 0 };
      wheel.sum += e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? feed.clientHeight : 1);
      clearTimeout(wheel.timer);
      wheel.timer = window.setTimeout(() => {
        const w = wheel;
        wheel = null;
        if (Math.abs(w.sum) < WHEEL_MIN_PX || pendingRef.current != null) return;
        if (activeRef.current !== w.from || nearest() !== w.from) return; // native scroll already moved
        cb.current.onWheelStep(w.sum > 0 ? 1 : -1);
      }, WHEEL_GESTURE_END_MS);
    };

    feed.addEventListener('wheel', onWheel, { passive: true });
    feed.addEventListener('scroll', onScroll, { passive: true });
    feed.addEventListener('scrollend', settle);
    feed.addEventListener('touchstart', onTouchStart, { passive: true });
    feed.addEventListener('touchend', onTouchEnd, { passive: true });
    feed.addEventListener('touchcancel', onTouchEnd, { passive: true });
    // Keep the current (or in-flight) slide aligned when the viewport changes (rotation, URL bar).
    const ro = typeof ResizeObserver === 'function'
      ? new ResizeObserver(() => { feed.scrollTop = (pendingRef.current ?? activeRef.current) * feed.clientHeight; })
      : null;
    ro?.observe(feed);
    return () => {
      clearTimeout(settleTimer);
      if (wheel) clearTimeout(wheel.timer);
      feed.removeEventListener('wheel', onWheel);
      feed.removeEventListener('scroll', onScroll);
      feed.removeEventListener('scrollend', settle);
      feed.removeEventListener('touchstart', onTouchStart);
      feed.removeEventListener('touchend', onTouchEnd);
      feed.removeEventListener('touchcancel', onTouchEnd);
      ro?.disconnect();
    };
  }, [feedRef, total, activeRef]);

  return { scrollToIndex, pendingRef, isInteracting };
}
