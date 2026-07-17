import os
import osmnx as ox
import geopandas as gpd

def extract_urban_infrastructure():
    print("\n--- Starting Day 2: Extracting Vulnerable Zones & Emission Sources ---")
    
    # Define bounding box coordinates for Hyderabad
    min_lon, min_lat = 78.23, 17.20
    max_lon, max_lat = 78.68, 17.60
    
    # Tags mapping infrastructure features via OpenStreetMap protocols
    tags_filter = {
        "amenity": ["school", "university", "hospital", "clinic"],
        "landuse": ["industrial", "quarry"]
    }
    
    print("Querying OpenStreetMap. This should only take a few seconds...")
    try:
        # CORRECTED FIX: osmnx v2.0+ expects bbox=(left, bottom, right, top)
        # Which translates to (min_lon, min_lat, max_lon, max_lat)
        gdf_pois = ox.features_from_bbox(
            bbox=(min_lon, min_lat, max_lon, max_lat), 
            tags=tags_filter
        )
    except Exception as e:
        print(f"API Fetch Error: {e}")
        return

    # Filter columns to keep dataset clean
    columns_to_keep = ['geometry', 'amenity', 'landuse', 'name']
    available_cols = [col for col in columns_to_keep if col in gdf_pois.columns]
    gdf_pois = gdf_pois[available_cols].copy()
    
    # Classify each point/polygon into distinct layers
    def classify_poi(row):
        if hasattr(row, 'landuse') and row['landuse'] in ['industrial', 'quarry']:
            return 'Industrial Source'
        elif hasattr(row, 'amenity') and row['amenity'] in ['hospital', 'clinic']:
            return 'Vulnerable - Healthcare'
        elif hasattr(row, 'amenity') and row['amenity'] in ['school', 'university']:
            return 'Vulnerable - Educational'
        return 'Other Infrastructure'
        
    gdf_pois['poi_type'] = gdf_pois.apply(classify_poi, axis=1)
    
    # Drop rows without meaningful geometries
    gdf_pois = gdf_pois[gdf_pois.geometry.notnull()]
    
    # Reset indices to clean up OSM multi-indexing
    gdf_pois = gdf_pois.reset_index(drop=True)
    
    output_dir = os.path.join("geospatial", "geo_data")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "urban_features.geojson")
    
    # Save output to disk
    gdf_pois.to_file(output_path, driver="GeoJSON")
    print(f"Success! Map Elements Extracted: {len(gdf_pois)} distinct locations.")
    print(f"Saved infrastructure profiles to: {output_path}")

if __name__ == "__main__":
    # Configure osmNX settings for headless script environments
    ox.settings.log_console = False
    ox.settings.use_cache = True
    extract_urban_infrastructure()