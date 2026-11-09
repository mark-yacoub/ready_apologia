import { useCallback, useEffect, useRef } from 'react';
import { loadYouTubeIframeApi } from '../../utils/youtubeIframeApi.js';

/** If the player has not reported ready by then (blocked iframe, dead network), give up. */
const READY_TIMEOUT_MS = 20000;

const PLAYER_VARS = Object.freeze({
  autoplay: 1,
  controls: 0,
  disablekb: 1,
  fs: 0,
  playsinline: 1,
  rel: 0,
  modestbranding: 1,
  iv_load_policy: 3,
});

/**
 * Owns ONE YouTube IFrame API player mounted inside `hostRef` for the component's lifetime.
 *
 * - The API is loaded lazily; the player is created once and destroyed on unmount.
 * - Every event is dropped once the hook is torn down or the player was replaced, so no callback
 *   runs against a destroyed player (e.g. after `astro:before-swap` unmounts the reel).
 * - `onFail` fires once if the API cannot load or the player never becomes ready.
 * - Callbacks are read from the latest render, so callers need not memoise them.
 *
 * @param {{ current: HTMLElement | null }} hostRef
 * @param {{
 *   getInitialVideoId: () => string,
 *   onReady: (player: any) => void,
 *   onStateChange: (state: number, player: any) => void,
 *   onError: (code: number, player: any) => void,
 *   onFail: () => void,
 * }} callbacks
 */
export default function useYouTubePlayer(hostRef, callbacks) {
  const playerRef = useRef(null);
  const readyRef = useRef(false);
  /** The video id most recently handed to the player (set before it actually loads). */
  const loadedIdRef = useRef(null);
  const cb = useRef(callbacks);
  cb.current = callbacks;

  useEffect(() => {
    let cancelled = false;
    let readyTimer = 0;
    const fail = (reason) => {
      if (cancelled) return;
      cancelled = true;
      console.warn('[reel] YouTube player unavailable:', reason);
      cb.current.onFail();
    };

    loadYouTubeIframeApi()
      .then((YT) => {
        if (cancelled || !hostRef.current) return;
        const mount = document.createElement('div');
        hostRef.current.appendChild(mount);
        const videoId = cb.current.getInitialVideoId();
        loadedIdRef.current = videoId;
        const live = () => !cancelled && playerRef.current === player;
        const player = new YT.Player(mount, {
          width: '100%',
          height: '100%',
          videoId,
          playerVars: { ...PLAYER_VARS, origin: location.origin },
          events: {
            onReady: () => {
              if (!live()) return;
              clearTimeout(readyTimer);
              readyRef.current = true;
              cb.current.onReady(player);
            },
            onStateChange: (e) => { if (live()) cb.current.onStateChange(e.data, player); },
            onError: (e) => { if (live()) cb.current.onError(e.data, player); },
          },
        });
        playerRef.current = player;
        readyTimer = window.setTimeout(() => {
          if (readyRef.current) return;
          destroy();
          fail('no onReady');
        }, READY_TIMEOUT_MS);
        const iframe = player.getIframe?.();
        if (iframe) {
          iframe.setAttribute('title', 'YouTube video player');
          iframe.setAttribute('tabindex', '-1');
        }
      })
      .catch((err) => fail(err?.message || err));

    function destroy() {
      readyRef.current = false;
      try { playerRef.current?.destroy(); } catch { /* iframe already removed */ }
      playerRef.current = null;
    }

    return () => {
      cancelled = true;
      clearTimeout(readyTimer);
      destroy();
    };
  }, [hostRef]);

  /** The player once it is ready, else null. */
  const getPlayer = useCallback(() => (readyRef.current ? playerRef.current : null), []);

  /** Loads (and autoplays) `videoId`; returns false while the player is not ready. */
  const loadVideo = useCallback((videoId) => {
    const p = getPlayer();
    if (!p) return false;
    loadedIdRef.current = videoId;
    p.loadVideoById(videoId);
    return true;
  }, [getPlayer]);

  return { getPlayer, loadVideo, loadedIdRef };
}
