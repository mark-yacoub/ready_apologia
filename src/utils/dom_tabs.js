/**
 * Resolves user tab priorities directly on the DOM nodes, updating inline layout 
 * and rewriting hyperlinks for zero-redirect native navigation.
 * 
 * @param {string} storageKey The local storage key containing the user's order array.
 * @param {Array<string>} defaultOrder Fallback order if no user preference is cached.
 * @param {string} rowSelector The DOM selector wrapping individual rows.
 * @param {string} traySelector The DOM selector wrapping the visual badges inside a row.
 * @param {string} linkSelector The DOM selector for the verse text hyperlink to hijack.
 */
export function enforceUserBadgePriority(storageKey, defaultOrder, rowSelector, traySelector, linkSelector) {
  try {
    const savedOrder = localStorage.getItem(storageKey);
    let order = defaultOrder;
    if (savedOrder) {
      const parsed = JSON.parse(savedOrder);
      if (Array.isArray(parsed) && parsed.length > 0) {
        order = parsed;
      }
    }
    
    // Fallback security against corrupted arrays
    if (!Array.isArray(order)) {
      order = defaultOrder;
    }
    
    const rows = document.querySelectorAll(rowSelector);
    rows.forEach(targetRow => {
      const badgeTray = targetRow.querySelector(traySelector);
      if (!badgeTray) return;
      
      const badges = Array.from(badgeTray.querySelectorAll('[data-tab-id]'));
      let highestPriorityIndex = Infinity;
      let highestPriorityHref = '';

      badges.forEach(badge => {
        const tabId = badge.getAttribute('data-tab-id');
        const idx = order.indexOf(tabId);
        
        // Items not found in the order array get shunted to the end
        const assignedOrder = idx !== -1 ? idx : order.length;
        
        if (badge instanceof HTMLElement) {
          badge.style.order = String(assignedOrder + 1);
        }
        
        if (assignedOrder < highestPriorityIndex) {
           highestPriorityIndex = assignedOrder;
           if (badge.href) {
             highestPriorityHref = badge.href;
           }
        }
      });

      // Swap the verse text anchor to point to the user's custom highest priority tab
      if (highestPriorityHref && linkSelector) {
         const verseTextLinks = targetRow.querySelectorAll(linkSelector);
         verseTextLinks.forEach(l => {
           if (l instanceof HTMLAnchorElement) {
              l.href = highestPriorityHref;
           }
         });
      }
    });
  } catch (e) {
    console.error(`Failed to enforce badge priority for ${storageKey}`, e);
  }
}
