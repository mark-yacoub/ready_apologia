import React, { useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export default function ManuscriptLightbox({ imgSrc, fileName, onClose, handleDownload }) {
  // Handle Keyboard Escape key to close modal (A11y/UX)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div className="fullscreen-lightbox-container">
      {/* Explicit Backdrop captures clicks strictly outside the content */}
      <div 
        className="lightbox-backdrop" 
        onClick={onClose} 
        aria-label="Close fullscreen view" 
        role="button" 
        tabIndex={0}
      />
      
      {/* Modal Content - Avoids event bubbling hacks */}
      <div className="lightbox-content">
        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={4}
          centerZoomedOut={true}
          wheel={{ step: 0.1 }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <React.Fragment>
              <div className="lightbox-header">
                <span className="lightbox-title">Fullscreen Magnifier</span>
                
                {/* Magnification controls hidden on mobile */}
                <div className="lightbox-zoom-controls desktop-only select-none">
                  <button onClick={() => zoomOut()} className="zoom-ctrl-btn" title="Zoom Out">−</button>
                  <button onClick={() => resetTransform()} className="zoom-ctrl-btn" title="Reset">⟲</button>
                  <button onClick={() => zoomIn()} className="zoom-ctrl-btn" title="Zoom In">+</button>
                </div>

                <button className="lightbox-close-btn" onClick={onClose} aria-label="Close modal" title="Close (Esc)">
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="lightbox-zoom-area">
                <TransformComponent wrapperClass="zoom-wrapper" contentClass="zoom-content">
                  <img 
                    src={imgSrc} 
                    alt="Manuscript fragment fullscreen magnification" 
                    className="lightbox-image"
                  />
                </TransformComponent>
              </div>

              <div className="lightbox-footer">
                <button 
                  onClick={(e) => handleDownload(e, imgSrc, fileName)} 
                  className="lightbox-save-btn"
                  title="Direct download high-resolution scan to local device gallery"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Save Scan to device</span>
                </button>
              </div>
            </React.Fragment>
          )}
        </TransformWrapper>
      </div>
    </div>
  );
}
