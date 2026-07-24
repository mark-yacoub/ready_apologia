export interface DiscoverItem {
  slug: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  thumbnail?: string;
}

export interface SubCategoryGroup {
  name: string;
  articles: DiscoverItem[];
}

export interface CategoryGroup {
  name: string;
  subcategories: SubCategoryGroup[];
}

export function clusterCatalogData(rawData: unknown[]): CategoryGroup[] {
  
  // 1. Validate and Fail Loudly on bad schema rows (Protect the UI from swallowing errors)
  const validatedData = rawData.filter((item): item is DiscoverItem => {
    // Top-level object structure check to fulfill 'unknown' contract
    if (typeof item !== 'object' || item === null) return false;
    
    // Safely cast to a generic dictionary to test specific properties
    const obj = item as Record<string, unknown>;
    
    if (typeof obj.title !== 'string' || obj.title.trim() === '' ||
        typeof obj.slug !== 'string' || obj.slug.trim() === '' ||
        typeof obj.category !== 'string' || obj.category.trim() === '' ||
        typeof obj.subcategory !== 'string' || obj.subcategory.trim() === '') {
      
      console.error(`\n🚨 [Discover Catalog Error] Malformed row dropped from build mapping: ${JSON.stringify(item)}\n`);
      return false;
    }
    return true; // Item complies with required schema
  });
  
  // 2. Cluster defensivly in a single O(N) pass 
  const clusteredMap = validatedData.reduce<Record<string, Record<string, DiscoverItem[]>>>((acc, item) => {
    const cat = item.category.trim();
    const sub = item.subcategory.trim();
    
    if (!acc[cat]) acc[cat] = {};
    if (!acc[cat][sub]) acc[cat][sub] = [];
    
    acc[cat][sub].push(item);
    return acc;
  }, {});

  // 3. Transform to a flat Array sequence for the UI thread to map over painlessly
  return Object.keys(clusteredMap).map(catName => {
    const subObj = clusteredMap[catName];
    const subcategories = Object.keys(subObj).map(subName => {
      return {
        name: subName,
        articles: subObj[subName]
      };
    });
    
    return {
      name: catName,
      subcategories: subcategories
    };
  });
}
