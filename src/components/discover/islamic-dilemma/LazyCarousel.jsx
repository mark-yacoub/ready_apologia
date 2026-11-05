import React, { useEffect, useState } from 'react';
import ManuscriptCarousel from '../../ManuscriptCarousel.jsx';

/**
 * Renders the shared ManuscriptCarousel only in the browser, after hydration.
 *
 * The carousel's <img> tags have no loading="lazy", and an <img> inside a closed <details> is still
 * fetched if it is in the server HTML. This wrapper server-renders a small placeholder instead, so a
 * closed "See the scans" disclosure downloads nothing. Used with `client:visible`: the island
 * hydrates when its placeholder becomes visible, i.e. when the reader opens the <details>.
 */
export default function LazyCarousel({ loadingLabel = '', ...props }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  if (!ready) return <div className="idl-carousel-ph">{loadingLabel}</div>;
  return <ManuscriptCarousel {...props} />;
}
