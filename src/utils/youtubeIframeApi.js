/**
 * Lazily loads the YouTube IFrame Player API (https://www.youtube.com/iframe_api) exactly once.
 *
 * Nothing on the site loads it at page load: call this only from a user gesture (e.g. "Play all").
 * The script tag may be dropped by a ClientRouter head swap, but `window.YT` stays, so later calls
 * resolve immediately. A failed load (offline, blocked) is not cached, so the next tap retries.
 */

const API_SRC = 'https://www.youtube.com/iframe_api';

/** @type {Promise<any> | null} */
let apiPromise = null;

/** Player error codes that mean "this video can't play here": skip it. */
export const UNPLAYABLE_ERROR_CODES = new Set([2, 5, 100, 101, 150, 153]);

/** `YT.PlayerState` values, usable before the API has loaded. */
export const PLAYER_STATE = Object.freeze({ UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 });

/**
 * @param {{ timeoutMs?: number }} [options]
 * @returns {Promise<any>} Resolves with `window.YT` once `YT.Player` is usable.
 */
export function loadYouTubeIframeApi({ timeoutMs = 15000 } = {}) {
  if (typeof window === 'undefined') return Promise.reject(new Error('YouTube API needs a browser'));
  if (window.YT && typeof window.YT.Player === 'function') return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve, reject) => {
    let settled = false;
    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn(value);
    };
    const fail = (message) => {
      apiPromise = null;
      finish(reject, new Error(message));
    };

    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previous === 'function') {
        try { previous(); } catch { /* another script's callback must not block ours */ }
      }
      finish(resolve, window.YT);
    };

    const timer = setTimeout(() => fail('YouTube player timed out'), timeoutMs);

    if (!document.querySelector(`script[src="${API_SRC}"]`)) {
      const script = document.createElement('script');
      script.src = API_SRC;
      script.async = true;
      script.onerror = () => {
        script.remove();
        fail('YouTube player could not load');
      };
      document.head.appendChild(script);
    }
  });
  return apiPromise;
}
