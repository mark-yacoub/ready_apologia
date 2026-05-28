import React, { useState, useRef } from 'react';

export default function ManuscriptCarousel({ manuscripts, verseId, verseLabel }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [fullScreenImg, setFullScreenImg] = useState(null);
  const [zoomFileName, setZoomFileName] = useState('');
  
  // Dynamic Magnification & Loading States (Ink Mode completely removed!)
  const [zoomScale, setZoomScale] = useState(1); // 1x to 3x magnifier
  const [loadedImages, setLoadedImages] = useState({}); // CDN spinner tracker
  const [failedImages, setFailedImages] = useState({}); // Broken cloud image 404 tracker
  
  const trackRef = useRef(null);

  // Production Cloudflare R2 CDN Base URL
  const R2_BASE_URL = 'https://pub-219566f197174e27a10f51e5fb2414f6.r2.dev';

  // Track Momentum Snapping index changes
  const handleTrackScroll = (e) => {
    const track = e.currentTarget;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    if (index !== activeSlide && index >= 0 && index < manuscripts.length) {
      setActiveSlide(index);
    }
  };

  // Dot Indicator click scroller
  const scrollToIndex = (index) => {
    if (trackRef.current) {
      trackRef.current.scrollTo({
        left: index * trackRef.current.clientWidth,
        behavior: 'smooth'
      });
      setActiveSlide(index);
    }
  };

  // Slide next/prev triggers
  const slideNext = (e) => {
    e.stopPropagation();
    const nextIndex = Math.min(activeSlide + 1, manuscripts.length - 1);
    scrollToIndex(nextIndex);
  };

  const slidePrev = (e) => {
    e.stopPropagation();
    const prevIndex = Math.max(activeSlide - 1, 0);
    scrollToIndex(prevIndex);
  };

  // Web Share panels
  const handleShare = async (e, ms) => {
    e.preventDefault();
    
    const cleanLabel = verseLabel || 'Scripture Verse';
    const shareData = {
      title: `${ms.name} - Manuscript Evidence`,
      text: `Check out the ancient manuscript evidence of ${ms.name} (~${ms.earliest_date} AD) proving ${cleanLabel}!`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.warn('Native Web Share failed:', err);
    }
  };

  // CORS Blob force-downloader (Saves scans natively to device galleries)
  const handleDownload = async (e, imgUrl, filename) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const localUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = localUrl;
      link.download = filename || 'manuscript_scan.jpg';
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(localUrl);
    } catch (err) {
      window.open(imgUrl, '_blank');
    }
  };

  const triggerZoom = (imgSrc, filename) => {
    setFullScreenImg(imgSrc);
    setZoomFileName(filename);
    setZoomScale(1); // Reset magnification
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
          const imgSrc = `${R2_BASE_URL}/images/${ms.ms_id}/${ms.image_name}`;
          const isLoaded = loadedImages[ms.image_name];

          return (
            <div key={ms.ms_id} className="carousel-slide">
              
              {/* Card Container */}
              <div className="slide-card">
                
                {/* 1. Manuscript Image Scan Frame (Double tap triggers Zoom Lightbox) */}
                <div className="ms-image-frame" onClick={() => triggerZoom(imgSrc, ms.image_name)}>
                  
                  {/* If image failed to load (404 or timeout), show clean offline warning fallback */}
                  {failedImages[ms.image_name] ? (
                    <div className="ms-skeleton-loader ms-error-fallback select-none">
                      <svg className="fallback-icon warning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" style={{ width: '24px', height: '24px', color: 'var(--color-secondary)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="loader-text bold-warn">Scan Not Available</span>
                      <span className="loader-text path-info">File: {ms.ms_id}/{ms.image_name}</span>
                    </div>
                  ) : (
                    <>
                      {/* Spinner loading overlay (Removed from DOM once onLoad triggers!) */}
                      {!isLoaded && (
                        <div className="ms-skeleton-loader">
                          <div className="pulse-spinner"></div>
                          <span className="loader-text">Downloading from cloud...</span>
                        </div>
                      )}

                      {/* Image is ALWAYS rendered to ensure browser triggers network loading immediately! */}
                      <img 
                        src={imgSrc} 
                        alt={`Ancient manuscript scan of ${ms.name}`} 
                        className={`ms-image ${isLoaded ? 'loaded' : 'loading'}`}
                        ref={(el) => {
                          if (el && el.complete && !isLoaded) {
                            // Force instant state update if the browser served it from cache before hydration!
                            setLoadedImages(prev => ({ ...prev, [ms.image_name]: true }));
                          }
                        }}
                        onLoad={() => setLoadedImages(prev => ({ ...prev, [ms.image_name]: true }))}
                        onError={() => {
                          setFailedImages(prev => ({ ...prev, [ms.image_name]: true }));
                          setLoadedImages(prev => ({ ...prev, [ms.image_name]: true })); // Shut down spinner
                        }}
                      />
                    </>
                  )}

                  {/* Desktop Arrow navigation chevrons */}
                  {activeSlide > 0 && (
                    <button 
                      onClick={slidePrev} 
                      className="carousel-nav-arrow prev-arrow"
                      title="View previous manuscript"
                    >
                      ‹
                    </button>
                  )}
                  {activeSlide < manuscripts.length - 1 && (
                    <button 
                      onClick={slideNext} 
                      className="carousel-nav-arrow next-arrow"
                      title="View next manuscript"
                    >
                      ›
                    </button>
                  )}

                  {/* Expand Zoom button */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); triggerZoom(imgSrc, ms.image_name); }} 
                    className="image-expand-btn"
                    title="View scan in fullscreen magnifier"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                  </button>

                  {/* Image Tag Type Overlay */}
                  <div className="ms-tag-overlay">
                    {ms.ms_id.startsWith('P') ? 'Papyrus' : 'Codex'}
                  </div>
                </div>

                {/* 2. Actions bar */}
                <div className="ms-action-bar">
                  <button 
                    onClick={(e) => handleShare(e, ms)} 
                    className="action-btn share-btn"
                    title="Share this manuscript evidence link"
                  >
                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l-5.348-2.674m0 0a3 3 0 110-5.348m0 5.348a3 3 0 110 5.348m5.348-2.674l5.348 2.674m0 0a3 3 0 110-5.348m0 5.348a3 3 0 110 5.348" />
                    </svg>
                    <span>Share Evidence</span>
                  </button>

                  <button 
                    onClick={(e) => handleDownload(e, imgSrc, ms.image_name)} 
                    className="action-btn save-btn"
                    title="Save scan directly to device photo gallery"
                  >
                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Save Scan</span>
                  </button>
                </div>

                {/* 3. Metadata block */}
                <div className="ms-metadata-block">
                  <div className="ms-meta-header">
                    <h4 className="ms-title">{ms.name || ms.ms_id}</h4>
                    <div className="ms-header-right-badges">
                      <span className="ms-index-counter">{index + 1} of {manuscripts.length}</span>
                      <span className="ms-id-tag">{ms.ms_id}</span>
                    </div>
                  </div>

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

      {/* Slider indicators */}
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

      {/* ============================================================
         5. Immersive Fullscreen Magnification Lightbox modal
         ============================================================ */}
      {fullScreenImg && (
        <div className="fullscreen-lightbox-modal" onClick={() => setFullScreenImg(null)}>
          
          {/* Header controls */}
          <div className="lightbox-header" onClick={(e) => e.stopPropagation()}>
            <span className="lightbox-title">Fullscreen Magnifier</span>
            
            {/* Magnification controls */}
            <div className="lightbox-zoom-controls select-none">
              <button 
                onClick={() => setZoomScale(prev => Math.max(prev - 0.25, 1))} 
                className="zoom-ctrl-btn"
                disabled={zoomScale === 1}
                title="Zoom Out"
              >
                −
              </button>
              <span className="zoom-percentage-tag">{Math.round(zoomScale * 100)}%</span>
              <button 
                onClick={() => setZoomScale(prev => Math.min(prev + 0.25, 3))} 
                className="zoom-ctrl-btn"
                disabled={zoomScale === 3}
                title="Zoom In"
              >
                +
              </button>
            </div>

            <button className="lightbox-close-btn" onClick={() => setFullScreenImg(null)} aria-label="Close modal">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Zoom magnifier panning panel */}
          <div className="lightbox-zoom-area">
            <img 
              src={fullScreenImg} 
              alt="Manuscript fragment fullscreen magnification" 
              className="lightbox-image"
              style={{ 
                transform: `scale(${zoomScale})`, 
                transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                cursor: zoomScale > 1 ? 'grab' : 'zoom-in'
              }}
            />
          </div>

          {/* Bottom action */}
          <div className="lightbox-footer" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={(e) => handleDownload(e, fullScreenImg, zoomFileName)} 
              className="lightbox-save-btn"
              title="Direct download high-resolution scan to local device gallery"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Save Scan to device</span>
            </button>
          </div>

        </div>
      )}

      {/* Core styles block definitions */}
      <style>{`
        .carousel-container {
          display: flex;
          flex-direction: column;
          width: 100%;
          position: relative;
        }

        .carousel-track {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          scrollbar-width: none;
          -ms-overflow-style: none;
          width: 100%;
        }
        .carousel-track::-webkit-scrollbar {
          display: none;
        }

        .carousel-slide {
          flex: 0 0 100%;
          width: 100%;
          scroll-snap-align: start;
          box-sizing: border-box;
          padding: 4px;
        }

        .slide-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-outline-variant);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          display: flex;
          flex-direction: column;
        }

        /* 1. Image Frame layout */
        .ms-image-frame {
          height: 190px;
          background-color: var(--color-surface-container-low);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          border-bottom: 1px solid var(--color-outline-variant);
          cursor: zoom-in;
        }

        .ms-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.95;
          mix-blend-mode: multiply;
          transition: transform 0.3s ease, opacity 0.2s ease;
        }
        
        .ms-image.loading {
          opacity: 0; /* Keep in DOM, but make fully invisible until loaded! */
        }
        .ms-image.loaded {
          opacity: 0.95;
          animation: fadeIn 0.3s ease forwards;
        }

        /* Pulse skeletons for dynamic loading visual status */
        .ms-skeleton-loader {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background-color: var(--color-surface-container-low);
          z-index: 5;
        }
        .pulse-spinner {
          width: 22px;
          height: 22px;
          border: 2.5px solid var(--color-outline-variant);
          border-top-color: var(--color-secondary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .loader-text {
          font-size: 10px;
          font-weight: 700;
          color: var(--color-on-surface-variant);
          opacity: 0.8;
        }

        /* Translucent zoom expand card triggers */
        .image-expand-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.88);
          color: var(--color-primary);
          border: 1px solid var(--color-outline-variant);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.15s, transform 0.1s;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
          z-index: 8;
        }
        .image-expand-btn:hover {
          background-color: #ffffff;
          transform: scale(1.05);
        }
        .image-expand-btn svg {
          stroke: currentColor;
          fill: none;
        }

        /* Hover desktop chevrons arrows */
        .carousel-nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.88);
          color: var(--color-primary);
          border: 1px solid var(--color-outline-variant);
          display: none;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          font-size: 20px;
          font-weight: 600;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
          transition: all 0.2s ease;
          opacity: 0;
          pointer-events: none;
          padding-bottom: 3px;
        }

        @media (min-width: 768px) {
          .ms-image-frame:hover .carousel-nav-arrow {
            opacity: 1;
            pointer-events: auto;
          }
          .carousel-nav-arrow {
            display: flex;
          }
        }

        .carousel-nav-arrow:hover {
          background-color: #ffffff;
          transform: translateY(-50%) scale(1.06);
        }
        .carousel-nav-arrow:active {
          transform: translateY(-50%) scale(0.96);
        }

        .prev-arrow {
          left: 12px;
        }
        .next-arrow {
          right: 12px;
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

        /* 2. Action bar buttons */
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

        .share-btn {
          border-right: 1px solid var(--color-outline-variant);
        }

        .action-btn svg {
          stroke: currentColor;
          fill: none;
        }

        /* 3. Details Metadata catalog */
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

        /* Indicator Dots */
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
          border: 8px solid transparent;
          background-clip: padding-box;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
          margin: -6px;
          padding: 0;
        }

        .indicator-dot.active {
          background-color: var(--color-secondary);
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

        /* ==========================================================================
           5. Immersive Lightbox zoom controls
           ========================================================================== */
        .fullscreen-lightbox-modal {
          position: fixed;
          inset: 0;
          background-color: rgba(9, 9, 11, 0.99);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          animation: fadeIn 0.25s ease-out forwards;
          max-width: 412px;
          margin: 0 auto;
        }
        
        @media (min-width: 768px) {
          .fullscreen-lightbox-modal {
            max-width: 1100px;
            border-radius: 20px;
          }
        }

        .lightbox-header {
          height: 56px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 20px;
          color: #ffffff;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .lightbox-title {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.3px;
          opacity: 0.9;
        }

        .lightbox-zoom-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 3px 8px;
          border-radius: 20px;
        }
        .zoom-ctrl-btn {
          background: none;
          border: none;
          color: #ffffff;
          width: 24px;
          height: 24px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.15s;
        }
        .zoom-ctrl-btn:hover:not(:disabled) {
          background-color: rgba(255, 255, 255, 0.08);
        }
        .zoom-ctrl-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .zoom-percentage-tag {
          font-size: 11px;
          font-weight: 700;
          color: #ffffff;
          min-width: 38px;
          text-align: center;
          opacity: 0.95;
        }

        .lightbox-close-btn {
          background: none;
          border: none;
          color: #ffffff;
          opacity: 0.8;
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }
        .lightbox-close-btn:hover {
          opacity: 1;
          background-color: rgba(255, 255, 255, 0.08);
        }

        .lightbox-zoom-area {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow: auto;
          -webkit-overflow-scrolling: touch;
        }

        .lightbox-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
          border-radius: 8px;
          transform-origin: center center;
        }

        .lightbox-footer {
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-bottom: env(safe-area-inset-bottom);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          background-color: rgba(9, 9, 11, 0.96);
        }

        .lightbox-save-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background-color: var(--color-secondary);
          color: #ffffff;
          font-family: var(--font-body);
          font-size: 12.5px;
          font-weight: 700;
          border: none;
          border-radius: 99px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(151, 69, 67, 0.3);
        }
        .lightbox-save-btn:hover {
          opacity: 0.95;
          transform: translateY(-1px);
        }
        .lightbox-save-btn:active {
          transform: translateY(0);
        }
        .lightbox-save-btn svg {
          stroke: currentColor;
          fill: none;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
}
