/**
 * Quick Points client entry module.
 * Delegates view construction to `./sheet-view.js` and URL/history navigation to `./sheet-nav.js`.
 */
import { bindQuickPointsNavigation } from './sheet-nav.js';

bindQuickPointsNavigation();
