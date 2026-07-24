import rawDivinityTimeline from '../../data/divinityTimeline.json';
import { getTimelineViewData } from '../../utils/timelineHelpers.js';

export async function GET() {
    const mapData = getTimelineViewData(rawDivinityTimeline);
    
    return new Response(JSON.stringify(mapData), {
        status: 200,
        headers: { 
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=604800, immutable" // allow aggressive caching
        }
    });
}
