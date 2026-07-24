class DivinityTimelineApp extends HTMLElement {
    constructor() {
        super();
        this.timelineEventsData = {};
    }

    async connectedCallback() {
        const dataEl = this.querySelector('#timeline-data-store');
        if (!dataEl) return;
        
        this.totalCenturies = parseInt(dataEl.dataset.totalCents || '0', 10);
        this.totalCountries = parseInt(dataEl.dataset.totalCountries || '0', 10);
        this.totalCategories = parseInt(dataEl.dataset.totalCats || '0', 10);
        
        try {
            const response = await fetch('/api/timeline-data.json');
            if (response.ok) {
                const eventsData = await response.json();
                eventsData.forEach(e => { this.timelineEventsData[e.id] = e; });
            }
        } catch(e) {
            console.error("Failed to fetch timeline data", e);
        }

        this.setupModalEvents();
        this.setupFilters();
        this.bindCardClicks();
        this.setupCarousels();
    }
    
    getYoutubeId(url) {
        const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length == 11) ? match[2] : null;
    }

    bindCardClicks() {
        this.querySelectorAll('.timeline-card-compact').forEach(card => {
            // Remove the inline onclick attribute
            card.removeAttribute('onclick');
            card.addEventListener('click', (e) => {
                const id = card.dataset.id;
                const color = card.dataset.color;
                if (id) this.openModal(id, color);
            });
        });
    }

    openModal(id, color) {
        const event = this.timelineEventsData[id];
        if (!event) return;
        
        // Modal elements
        const modal = this.querySelector('#event-modal');
        const metaEl = this.querySelector('#modal-meta');
        const titleEl = this.querySelector('#modal-title');
        const summaryEl = this.querySelector('#modal-summary');
        const galleryEl = this.querySelector('#modal-gallery');
        const quotesEl = this.querySelector('#modal-quotes');
        const mdEl = this.querySelector('#modal-description');
        const videosEl = this.querySelector('#modal-videos-section');
        const sourcesEl = this.querySelector('#modal-sources-section');
        
        // 1. Meta & Text (Safe XSS protection built-in via textContent)
        metaEl.replaceChildren(); // Clear
        const badge = document.createElement('span');
        badge.className = 'modal-date-badge';
        badge.style.color = color;
        badge.textContent = event.displayDate;
        metaEl.appendChild(badge);
        
        titleEl.textContent = event.title;
        summaryEl.textContent = event.shortSummary || '';
        
        // 2. Gallery (Safe DOM rendering)
        galleryEl.replaceChildren();
        if (event.photos && event.photos.length > 0) {
            galleryEl.style.display = 'block';
            const wrapper = this.createCarouselWrapper();
            const container = wrapper.querySelector('.carousel-container');
            
            event.photos.forEach(p => {
                const img = document.createElement('img');
                img.src = p;
                img.className = 'modal-gallery-img';
                img.alt = "Timeline Photo";
                container.appendChild(img);
            });
            galleryEl.appendChild(wrapper);
        } else {
            galleryEl.style.display = 'none';
        }
        
        // 3. Quotes
        quotesEl.replaceChildren();
        if (event.quotes && event.quotes.length > 0) {
            quotesEl.style.display = 'flex';
            event.quotes.forEach(q => {
                const fig = document.createElement('figure');
                fig.className = 'timeline-quote';
                fig.style.borderLeftColor = color;
                
                const bq = document.createElement('blockquote');
                bq.textContent = `"${q.quote}"`;
                fig.appendChild(bq);
                
                if (q.translation) {
                    const fc = document.createElement('figcaption');
                    fc.textContent = `— ${q.translation}`;
                    fig.appendChild(fc);
                }
                quotesEl.appendChild(fig);
            });
        } else {
            quotesEl.style.display = 'none';
        }
        
        // 4. Description (Markdown parsing)
        if (event.description && window.marked) {
            mdEl.style.display = 'block';
            
            // L6 Standard: Sanitize compiler output before injecting it into the DOM
            const rawHtml = window.marked.parse(event.description);
            mdEl.innerHTML = window.DOMPurify ? window.DOMPurify.sanitize(rawHtml) : rawHtml;
            
            setTimeout(() => {
                if (window.renderMathInElement) {
                    window.renderMathInElement(mdEl, {
                        delimiters: [
                            {left: '$$', right: '$$', display: true},
                            {left: '$', right: '$', display: false},
                            {left: '\\(', right: '\\)', display: false},
                            {left: '\\[', right: '\\]', display: true}
                        ], throwOnError: false
                    });
                }
            }, 30);
        } else {
            mdEl.style.display = 'none';
        }
        
        // 5. Videos
        videosEl.replaceChildren();
        const validVideos = (event.videos || []).filter(v => typeof v === 'string' && v.trim().length > 0);
        if (validVideos.length > 0) {
            videosEl.style.display = 'block';
            const title = document.createElement('h3');
            title.className = 'modal-section-title';
            title.textContent = 'Videos';
            videosEl.appendChild(title);
            
            const wrapper = this.createCarouselWrapper();
            const container = wrapper.querySelector('.carousel-container');
            const tpl = document.getElementById('template-video-card');
            
            validVideos.forEach(v => {
                const yId = this.getYoutubeId(v);
                if (!yId || !tpl) return;
                
                const clone = tpl.content.cloneNode(true);
                const a = clone.querySelector('a');
                a.href = v;
                clone.querySelector('.rich-video-thumb').style.backgroundImage = `url('https://img.youtube.com/vi/${yId}/hqdefault.jpg')`;
                
                container.appendChild(clone);
            });
            videosEl.appendChild(wrapper);
        } else {
            videosEl.style.display = 'none';
        }
        
        // 6. Sources
        sourcesEl.replaceChildren();
        const validLinks = (event.links || []).filter(l => typeof l === 'string' && l.trim().length > 0);
        if (validLinks.length > 0) {
            sourcesEl.style.display = 'block';
            const title = document.createElement('h3');
            title.className = 'modal-section-title';
            title.textContent = 'Primary Sources & Articles';
            sourcesEl.appendChild(title);
            
            const wrapper = this.createCarouselWrapper();
            const container = wrapper.querySelector('.carousel-container');
            const tpl = document.getElementById('template-source-card');
            
            validLinks.forEach(l => {
                try {
                    if (!tpl) return;
                    const host = new URL(l).hostname;
                    const cleanHost = host.replace('www.', '');
                    const isWiki = cleanHost.includes('wikipedia.org');
                    const textTitle = isWiki ? 'Wikipedia Article' : cleanHost;
                    
                    const clone = tpl.content.cloneNode(true);
                    const a = clone.querySelector('a');
                    a.href = l;
                    clone.querySelector('img').src = `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
                    clone.querySelector('img').alt = cleanHost;
                    clone.querySelector('.rich-source-text').textContent = textTitle;
                    
                    container.appendChild(clone);
                } catch(e) {}
            });
            sourcesEl.appendChild(wrapper);
        } else {
            sourcesEl.style.display = 'none';
        }
        
        document.body.style.overflow = 'hidden';
        modal.showModal();
        
        setTimeout(() => {
            const scrollArea = modal.querySelector('.modal-scroll-area');
            if (scrollArea) scrollArea.scrollTop = 0;
        }, 10);
    }
    
    createCarouselWrapper() {
        const wrapper = document.createElement('div');
        wrapper.className = 'carousel-wrapper';
        
        const prev = document.createElement('button');
        prev.className = 'nav-btn prev-btn';
        prev.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>';
        
        const container = document.createElement('div');
        container.className = 'carousel-container';
        
        prev.onclick = () => container.scrollBy({left: -260, behavior: 'smooth'});

        const next = document.createElement('button');
        next.className = 'nav-btn next-btn';
        next.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>';
        next.onclick = () => container.scrollBy({left: 260, behavior: 'smooth'});
        
        wrapper.appendChild(prev);
        wrapper.appendChild(container);
        wrapper.appendChild(next);
        return wrapper;
    }

    applyFilters() {
        const getChecked = (name) => Array.from(this.querySelectorAll(`input[name="${name}"]:checked`)).map(el => el.value);
        const selectedCats = getChecked('filter-category');
        const selectedCountries = getChecked('filter-country');
        const selectedCents = getChecked('filter-century');

        // L6 Standard: Delegate filter matrix rendering to native CSS matching engine via injected stylesheet 
        // to completely eliminate layout recalculation loops and thrashing
        let styleEl = document.getElementById('l6-dynamic-filter-styles');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'l6-dynamic-filter-styles';
            this.appendChild(styleEl);
        }

        const allCats = Array.from(this.querySelectorAll(`input[name="filter-category"]`)).map(el => el.value);
        const allCountries = Array.from(this.querySelectorAll(`input[name="filter-country"]`)).map(el => el.value);
        const allCents = Array.from(this.querySelectorAll(`input[name="filter-century"]`)).map(el => el.value);

        const unCats = allCats.filter(c => !selectedCats.includes(c));
        const unCountries = allCountries.filter(c => !selectedCountries.includes(c));
        const unCents = allCents.filter(c => !selectedCents.includes(c));

        let css = '';
        unCats.forEach(c => { css += `.timeline-event[data-category="${c}"] { display: none !important; }\n`; });
        unCountries.forEach(c => { css += `.timeline-event[data-country="${c}"] { display: none !important; }\n`; });
        unCents.forEach(c => { css += `.timeline-event[data-century="${c}"] { display: none !important; }\n`; });
        
        styleEl.textContent = css;

        // O(N) memory loop for empty-state checking. (No DOM Layout reads/writes, zero thrashing)
        let visibleCount = 0;
        this.querySelectorAll('.timeline-event').forEach(el => {
            if (!unCats.includes(el.dataset.category) && 
                !unCountries.includes(el.dataset.country) && 
                !unCents.includes(el.dataset.century)) {
                visibleCount++;
            }
        });
        const noRes = this.querySelector('#no-results-msg');
        if (noRes) noRes.style.display = visibleCount === 0 ? 'block' : 'none';
        
        // Form states
        const isFrag = (selectedCats.length < this.totalCategories) || (selectedCountries.length < this.totalCountries) || (selectedCents.length < this.totalCenturies);
        const btn = this.querySelector('.filter-trigger-btn');
        if (btn) {
            if (isFrag) btn.classList.add('filtering-active');
            else btn.classList.remove('filtering-active');
        }
    }

    setupFilters() {
        // Monitor all checkboxes
        this.querySelectorAll('input[type="checkbox"]').forEach(box => {
            box.addEventListener('change', () => this.applyFilters());
        });
        
        // Expose global button functions safely since they are technically bound to buttons in header
        window.resetFilters = () => {
           this.querySelectorAll('input[type="checkbox"]').forEach(box => box.checked = true);
           this.applyFilters();
        };

        window.selectOnly = (groupName, val) => {
           this.querySelectorAll(`input[name="${groupName}"]`).forEach(box => {
              box.checked = (box.value === val);
           });
           this.applyFilters();
        };

        window.toggleAll = (groupName) => {
           const boxes = Array.from(this.querySelectorAll(`input[name="${groupName}"]`));
           const allChecked = boxes.every(b => b.checked);
           boxes.forEach(box => {
              box.checked = !allChecked;
           });
           this.applyFilters();
        };
    }

    setupModalEvents() {
        const modal = this.querySelector('#event-modal');
        const closeBtn = this.querySelector('#modal-close');
        
        if (modal && closeBtn) {
            const closeModal = () => {
                modal.close();
                document.body.style.overflow = '';
            };
            closeBtn.addEventListener('click', closeModal);
            
            modal.addEventListener('click', (e) => {
                const dims = modal.getBoundingClientRect();
                if (
                    e.clientX < dims.left || e.clientX > dims.right ||
                    e.clientY < dims.top || e.clientY > dims.bottom
                ) {
                    closeModal();
                }
            });
        }
    }

    setupCarousels() {
        this.addEventListener('mousedown', (e) => {
            const carousel = e.target.closest('.carousel-container');
            if (!carousel) return;
            
            let isDown = true;
            let startX = e.pageX - carousel.offsetLeft;
            let scrollLeft = carousel.scrollLeft;
            let hasDragged = false;
            
            const mouseMoveHandler = (e2) => {
                if(!isDown) return;
                const x = e2.pageX - carousel.offsetLeft;
                const walk = (x - startX) * 1.5;
                if (Math.abs(walk) > 10) {
                    hasDragged = true;
                    e2.preventDefault();
                    carousel.style.scrollSnapType = 'none';
                    carousel.scrollLeft = scrollLeft - walk;
                }
            };
            
            const mouseUpHandler = () => {
                isDown = false;
                carousel.style.scrollSnapType = '';
                if (hasDragged) {
                    const preventClick = (e4) => {
                        e4.preventDefault();
                        e4.stopPropagation();
                        window.removeEventListener('click', preventClick, true);
                    };
                    window.addEventListener('click', preventClick, true);
                    setTimeout(() => window.removeEventListener('click', preventClick, true), 50);
                }
                document.removeEventListener('mousemove', mouseMoveHandler);
                window.removeEventListener('mouseup', mouseUpHandler);
            };
            
            document.addEventListener('mousemove', mouseMoveHandler);
            window.addEventListener('mouseup', mouseUpHandler);
        });
    }
}

customElements.define('divinity-timeline-app', DivinityTimelineApp);
