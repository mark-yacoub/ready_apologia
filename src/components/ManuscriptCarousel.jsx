import React, { useState, useRef, useEffect } from 'react';

export default function ManuscriptCarousel({ manuscripts, verseId, verseLabel }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const trackRef = useRef(null);

  // Fallback mock local scans list (matching server folder)
  const LOCAL_COPIED_FILES = [
    'p4_fragC_recto.jpg',
    'p4_fragA_recto.jpg',
    'p5_0001a.jpg',
    'p10_rom1.jpg',
    'p17_heb9_recto.jpg',
    'p17_heb9_verso.jpg'
  ];

  // Track browser active scroll snapping natively
  const handleTrackScroll = (e) => {
    const track = e.currentTarget;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    if (index !== activeSlide && index >= 0 && index < manuscripts.length) {
      setActiveSlide(index);
    }
  };

  // Tap dot indicator to slide to specific manuscript smoothly
  const scrollToIndex = (index) => {
    if (trackRef.current) {
      trackRef.current.scrollTo({
        left: index * trackRef.current.clientWidth,
        behavior: 'smooth'
      });
      setActiveSlide(index);
    }
  };

  // Web Share API Integration (Instantly triggers iOS/Android native sharing sheet)
  const handleShare = async (e, ms) => {
    e.preventDefault();
    
    const cleanLabel = verseLabel || 'Scripture Verse';
    const shareData = {
      title: `${ms.name} - Manuscript Evidence`,
      text: `Check out the ancient manuscript evidence of ${ms.name} (~${ms.earliest_date} AD) proving ${cleanLabel}!`,
      url: window.location.href // Direct indexable page link!
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Copy URL as safe fallback
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.warn('Native Web Share failed or dismissed:', err);
    }
  };

  if (!manuscripts || manuscripts.length === 0) {
    return <div className="carousel-empty">No manuscripts mapped for this verse.</div>;
  }

  return (
    <div className="carousel-container select-none">
      
      {/* Snapping Track Wrapper */}
      <div 
        className="carousel-track" 
        onScroll={handleTrackScroll} 
        ref={trackRef}
      >
        {manuscripts.map((ms, index) => {
          const isLocal = LOCAL_COPIED_FILES.includes(ms.image_name);
          const imgSrc = isLocal ? `/images/manuscripts/${ms.image_name}` : null;

          return (
            <div key={ms.ms_id} className="carousel-slide">
              
              {/* Card Container (Image + Actions + Meta slide together!) */}
              <div className="slide-card">
                
                {/* 1. Manuscript Image Scan Frame */}
                <div className="ms-image-frame">
                  {imgSrc ? (
                    <img 
                      src={imgSrc} 
                      alt={`Ancient manuscript scan of ${ms.name}`} 
                      className="ms-image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="ms-image-fallback">
                      <svg className="fallback-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="fallback-title">Manuscript Hosted in Cloud</span>
                      <span className="fallback-filename">File: {ms.image_name}</span>
                    </div>
                  )}

                  {/* Image Tag Type Overlay (e.g., Papyrus, Codex) */}
                  <div className="ms-tag-overlay">
                    {ms.ms_id.startsWith('P') ? 'Papyrus' : 'Codex'}
                  </div>
                </div>

                {/* 2. Apple-Style Action Bar (Share & Save) */}
                <div className="ms-action-bar">
                  {/* Native Share Button */}
                  <button 
                    onClick={(e) => handleShare(e, ms)} 
                    className="action-btn share-btn"
                    title="Share this manuscript evidence link"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l-5.348-2.674m0 0a3 3 0 110-5.348m0 5.348a3 3 0 110 5.348m5.348-2.674l5.348 2.674m0 0a3 3 0 110-5.348m0 5.348a3 3 0 110 5.348" />
                    </svg>
                    <span>Share Evidence</span>
                  </button>

                  {/* Direct Save / Download Link (Works offline!) */}
                  {imgSrc ? (
                    <a 
                      href={imgSrc} 
                      download={ms.image_name}
                      className="action-btn save-btn"
                      title="Download manuscript scan to device"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Save Scan</span>
                    </a>
                  ) : (
                    <span className="action-btn save-btn disabled">
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Save Scan</span>
                    </span>
                  )}
                </div>

                {/* 3. Manuscript Catalog Metadata */}
                <div className="ms-metadata-block">
                  <div className="ms-meta-header">
                    <h4 className="ms-title">{ms.name || ms.ms_id}</h4>
                    <div className="ms-header-right-badges">
                      <span className="ms-index-counter">{index + 1} of {manuscripts.length}</span>
                      <span className="ms-id-tag">{ms.ms_id}</span>
                    </div>
                  </div>

                  {/* Technical Grid Specs */}
                  <div className="ms-specs-grid">
                    <div className="spec-cell">
                      <span className="spec-label">Earliest Date</span>
                      <span className="spec-value">~{ms.earliest_date} AD ({ms.date_range_english || 'Unknown'})</span>
                    </div>
                    <div className="spec-cell">
                      <span className="spec-label">Current Location</span>
                      <span className="spec-value">{ms.current_location || 'Unknown'}</span>
                    </div>
                    <div className="spec-cell col-span-2">
                      <span className="spec-label">Found Location</span>
                      <span className="spec-value">{ms.found_location || 'Unknown'}</span>
                    </div>
                  </div>

                  {/* Academic Scribal Context Description */}
                  {ms.interesting_info && (
                    <div className="ms-context-info">
                      <span className="context-label">Scribal Context & Details</span>
                      <p className="context-text">{ms.interesting_info}</p>
                    </div>
                  )}
                </div>

              </div>
              
            </div>
          );
        })}
      </div>

      {/* 4. Active Dot Indicators (Pages pagination dots • • •) */}
      {manuscripts.length > 1 && (
        <div className="carousel-indicators">
          {manuscripts.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`indicator-dot ${activeSlide === index ? 'active' : ''}`}
              aria-label={`Go to manuscript slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Inline CSS Scopes */}
      <style>{`
        .carousel-container {
          display: flex;
          flex-direction: column;
          width: 100%;
          position: relative;
        }

        /* Native CSS Snapping Track */
        .carousel-track {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          scrollbar-width: none; /* Hide scrollbar Firefox */
          -ms-overflow-style: none;
          width: 100%;
        }
        .carousel-track::-webkit-scrollbar {
          display: none; /* Hide scrollbar Chrome/Safari */
        }

        .carousel-slide {
          flex: 0 0 100%;
          width: 100%;
          scroll-snap-align: start;
          box-sizing: border-box;
          padding: 4px; /* leaves nice drop shadow room */
        }

        /* Card Structure */
        .slide-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-outline-variant);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          display: flex;
          flex-direction: column;
        }

        /* 1. Manuscript Image Scan Frame */
        .ms-image-frame {
          height: 190px;
          background-color: var(--color-surface-container-low);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          border-bottom: 1px solid var(--color-outline-variant);
        }

        .ms-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.95;
          mix-blend-mode: multiply; /* Smooth background blend */
          transition: opacity 0.2s ease;
        }

        .ms-image-fallback {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: var(--color-on-surface-variant);
          text-align: center;
          padding: 20px;
        }
        .fallback-icon {
          width: 26px;
          height: 26px;
          color: var(--color-on-surface-variant);
          opacity: 0.5;
        }
        .fallback-title {
          font-size: 12px;
          font-weight: 700;
        }
        .fallback-filename {
          font-size: 9px;
          opacity: 0.65;
        }

        .ms-tag-overlay {
          position: absolute;
          bottom: 10px;
          left: 10px;
          padding: 3px 8px;
          background-color: var(--color-surface);
          border: 1px solid var(--color-outline-variant);
          color: var(--color-secondary);
          font-family: var(--font-body);
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }

        /* 2. Apple Action Bar (Share & Save) */
        .ms-action-bar {
          display: flex;
          border-bottom: 1px solid var(--color-outline-variant);
          background-color: #fafafa;
        }

        .action-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 12px;
          background: none;
          border: none;
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 700;
          color: var(--color-on-surface-variant);
          transition: all 0.15s ease;
          text-decoration: none;
        }
        .action-btn:hover {
          background-color: var(--color-surface-container-low);
          color: var(--color-primary);
        }
        .action-btn:active {
          transform: scale(0.97);
        }

        /* Divider Line */
        .share-btn {
          border-right: 1px solid var(--color-outline-variant);
        }

        .action-btn svg {
          stroke: currentColor;
          fill: none;
        }

        .action-btn.disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        .action-btn.disabled:hover {
          background-color: transparent;
          color: var(--color-on-surface-variant);
        }

        /* 3. Metadata Block */
        .ms-metadata-block {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ms-meta-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .ms-title {
          font-family: var(--font-body);
          font-size: 16px;
          font-weight: 800;
          color: var(--color-primary);
          margin: 0;
        }

        .ms-header-right-badges {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ms-index-counter {
          font-size: 10px;
          font-weight: 700;
          color: var(--color-on-surface-variant);
          opacity: 0.85;
        }

        .ms-id-tag {
          font-size: 9px;
          font-weight: 800;
          background-color: var(--color-surface-container-low);
          color: var(--color-on-surface-variant);
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid var(--color-outline-variant);
        }

        .ms-specs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          border-top: 1px solid var(--color-outline-variant);
          padding-top: 10px;
        }

        .spec-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .spec-cell.col-span-2 {
          grid-column: span 2;
        }

        .spec-label {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--color-on-surface-variant);
          letter-spacing: 0.5px;
          opacity: 0.8;
        }

        .spec-value {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-primary);
        }

        .ms-context-info {
          border-top: 1px solid var(--color-outline-variant);
          padding-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .context-label {
          font-size: 10px;
          font-weight: 800;
          color: var(--color-primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .context-text {
          font-size: 12.5px;
          line-height: 1.55;
          color: var(--color-on-surface-variant);
          margin: 0;
          text-align: justify;
        }

        /* 4. Slider Indicators Dots */
        .carousel-indicators {
          display: flex;
          justify-content: center;
          gap: 5px;
          margin-top: 12px;
        }

        .indicator-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--color-outline-variant);
          border: 8px solid transparent; /* 16px padding hit target */
          background-clip: padding-box;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
          margin: -6px; /* balance visual spacing offset */
          padding: 0;
        }

        .indicator-dot.active {
          background-color: var(--color-secondary); /* Terracotta active dot */
          transform: scale(1.1);
          width: 10px;
          border-radius: 5px;
        }

        .carousel-empty {
          text-align: center;
          padding: 32px 16px;
          color: var(--color-on-surface-variant);
          font-size: 13px;
          font-style: italic;
        }
      `}</style>

    </div>
  );
}
