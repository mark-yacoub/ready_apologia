import React, { useState, useRef } from 'react';
import '../styles/evidence-carousel.css';
import { R2_BASE_URL } from '../utils/cdn_config.js';

function getManuscriptTag(ms, isNT) {
  if (isNT) {
    return ms.ms_id.startsWith('P') ? 'Papyrus' : 'Codex';
  }
  const s = `${ms.ms_id} ${ms.name} ${ms.interesting_info || ''} ${ms.image_name || ''}`.toLowerCase();
  if (s.includes('codex') || ['A', 'B', 'G', 'Z', 'א'].includes(ms.ms_id)) return 'Codex';
  if (s.includes('phylactery') || s.includes('phyl')) return 'Phylactery';
  if (s.includes('mezuzah')) return 'Mezuzah';
  if (s.includes('scroll')) return 'Scroll';
  if (s.includes('papyrus') || s.includes('pap') || (ms.name && ms.name.toLowerCase().includes('p.'))) return 'Papyrus';
  return 'Fragment';
}

function formatDate(dateVal) {
  if (dateVal === null || dateVal === undefined || dateVal === '') return 'Unknown';
  const n = parseInt(dateVal, 10);
  if (isNaN(n)) return dateVal;
  return n < 0 ? `${Math.abs(n)} BC` : `AD ${n}`;
}

export default function ManuscriptCarousel({ manuscripts, verseId, verseLabel, isNT }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [fullScreenImg, setFullScreenImg] = useState(null);
  const [zoomFileName, setZoomFileName] = useState('');
  
  // Dynamic Magnification & Loading States (Ink Mode completely removed!)
  const [zoomScale, setZoomScale] = useState(1); // 1x to 3x magnifier
  const [loadedImages, setLoadedImages] = useState({}); // CDN spinner tracker
  const [failedImages, setFailedImages] = useState({}); // Broken cloud image 404 tracker
  
  const trackRef = useRef(null);



  // Track Momentum Snapping index changes
  const handleTrackScroll = (e) => {
    const track = e.currentTarget;
    const slideWidth = manuscripts.length > 1 ? track.clientWidth * 0.92 : track.clientWidth;
    const index = Math.round(track.scrollLeft / slideWidth);
    if (index !== activeSlide && index >= 0 && index < manuscripts.length) {
      setActiveSlide(index);
    }
  };

  // Dot Indicator click scroller
  const scrollToIndex = (index) => {
    if (trackRef.current) {
      const slideWidth = manuscripts.length > 1 ? trackRef.current.clientWidth * 0.92 : trackRef.current.clientWidth;
      trackRef.current.scrollTo({
        left: index * slideWidth,
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
      text: `Check out the ancient manuscript evidence of ${ms.name} (~${formatDate(ms.earliest_date)}) proving ${cleanLabel}!`,
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
          const rootDir = isNT ? 'images' : 'ot_images';
          const imgSrc = `${R2_BASE_URL}/${rootDir}/${ms.ms_id}/${ms.image_name}`;
          const isLoaded = loadedImages[ms.image_name];

          let formStr = '';
          if (!isNT) {
            if (ms.form && ms.material) {
              formStr = `, made as a ${ms.form.toLowerCase()} from ${ms.material.toLowerCase()},`;
            } else if (ms.form) {
              formStr = `, made as a ${ms.form.toLowerCase()},`;
            } else if (ms.material) {
              formStr = `, made from ${ms.material.toLowerCase()},`;
            }
          }

          let altText = `${ms.name || ms.ms_id}${formStr} showing ${verseLabel} from ${ms.date_range_english || 'Unknown'}`;
          if (ms.found_location) altText += ` found in ${ms.found_location}`;
          if (ms.current_location) altText += `, currently housed at ${ms.current_location}`;

          return (
            <div key={ms.image_name} className="carousel-slide">
              
              {/* Card Container */}
              <div className={`slide-card ${activeSlide === index ? 'active-card' : 'inactive-card'}`}>
                
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
                        alt={altText} 
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
                  <div className="ms-tags-container">
                    {isNT ? (
                      <div className="ms-tag-overlay">{getManuscriptTag(ms, true)}</div>
                    ) : (
                      <>
                        {ms.form && <div className="ms-tag-overlay">{ms.form}</div>}
                        {ms.material && <div className="ms-tag-overlay material-tag">{ms.material}</div>}
                        {(!ms.form && !ms.material) && <div className="ms-tag-overlay">{getManuscriptTag(ms, false)}</div>}
                      </>
                    )}
                  </div>
                </div>

                {/* 2. Actions bar */}
                <div className="ms-action-bar">
                  <button 
                    onClick={(e) => handleShare(e, ms)} 
                    className="action-btn share-btn"
                    title="Share this manuscript evidence link"
                  >
                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l-5.348-2.674m0 0a3 3 0 110-5.348m0 5.348a3 3 0 110 5.348m5.348-2.674l5.348 2.674m0 0a3 3 0 110-5.348m0 5.348a3 3 0 110 5.348" />
                    </svg>
                    <span>Share Evidence</span>
                  </button>

                  <button 
                    onClick={(e) => handleDownload(e, imgSrc, ms.image_name)} 
                    className="action-btn save-btn"
                    title="Save scan directly to device photo gallery"
                  >
                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
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
                    {!isNT && ms.language && (
                      <div className="spec-cell">
                        <span className="spec-label">Language</span>
                        <span className="spec-value">{ms.language}</span>
                      </div>
                    )}
                    <div className="spec-cell">
                      <span className="spec-label">Earliest Date</span>
                      <span className="spec-value">~{formatDate(ms.earliest_date)} ({ms.date_range_english || 'Unknown'})</span>
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
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
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
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Save Scan to device</span>
            </button>
          </div>

        </div>
      )}

      

    </div>
  );
}
