/**
 * Global configuration constants for external CDN asset storage (Cloudflare R2)
 * and the one Cloudflare Image Transformations preset we use.
 */
export const R2_BASE_URL = 'https://mss.readyapologia.com';

/** Bucket folder per corpus. */
export const SCAN_DIRS = Object.freeze({ nt: 'images', ot: 'ot_images', quran: 'quran' });

/** Encodes one URL path segment, including parentheses (several OT ms_ids are "(Great Isaiah Scroll)"-style). */
const encodeSegment = (s) => encodeURIComponent(String(s)).replace(/\(/g, '%28').replace(/\)/g, '%29');

/** Bucket path of a scan, every segment encoded: `images/P66/p66_bodmer_1.jpg`. */
export const scanPath = (dir, msId, imageName) => `${dir}/${encodeSegment(msId)}/${encodeSegment(imageName)}`;

/** Full-resolution scan URL (what the carousels show; often 5-10 MB). */
export const scanUrl = (dir, msId, imageName) => `${R2_BASE_URL}/${scanPath(dir, msId, imageName)}`;

/**
 * Social-preview preset (og:image / twitter:image), served by Cloudflare Image
 * Transformations on the readyapologia.com zone (Images > Transformations, sources:
 * "This zone only"; see CLOUDFLARE.md).
 *
 * Why: WhatsApp drops preview images over ~600 KB and shows the site icon instead.
 * - Fixed 1200x630 canvas: the whole scan is fitted inside (`fit=pad`, never cropped,
 *   never upscaled past the canvas), so the size is bounded (~30-60 KB) and we can
 *   declare og:image:width/height, which lets WhatsApp/Facebook render the card on
 *   the first share instead of fetching it in the background.
 * - `onerror=redirect`: if a transformation fails (e.g. the free 5,000 unique
 *   transformations/month are used up), Cloudflare redirects to the original scan,
 *   so a preview is never worse than before this preset existed.
 * - ONE preset only: each scan is a single unique transformation (~3,800 scans are
 *   ever used as previews, under the free 5,000/month). Other option strings are not
 *   blocked (the free plan's 5 WAF custom rules are all in use), so someone could
 *   exhaust the allowance; that is never billed and degrades to `onerror=redirect`.
 *   See CLOUDFLARE.md §9.
 */
export const OG_PREVIEW = Object.freeze({
  width: 1200,
  height: 630,
  type: 'image/jpeg',
  options: 'width=1200,height=630,fit=pad,background=white,quality=70,format=jpeg,onerror=redirect',
});

/** URL path prefix every preview URL starts with (checked by the SEO audit). */
export const OG_PREVIEW_PATH_PREFIX = `/cdn-cgi/image/${OG_PREVIEW.options}/`;

/**
 * Open Graph image for a scan: `{ url, width, height, type }`, the shape
 * `Layout.astro` accepts for its `ogImage` prop.
 */
export const scanOgImage = (dir, msId, imageName) => ({
  url: `${R2_BASE_URL}${OG_PREVIEW_PATH_PREFIX}${scanPath(dir, msId, imageName)}`,
  width: OG_PREVIEW.width,
  height: OG_PREVIEW.height,
  type: OG_PREVIEW.type,
});
