import os
import json
import numpy as np
import geopandas as gpd
from shapely.geometry import Polygon

def generate_hyderabad_grid():
    print("--- Starting Day 1: Grid Generation ---")
    
    # 1. Define the city bounding box coordinates (Hyderabad)
    min_lon, min_lat = 78.23, 17.20
    max_lon, max_lat = 78.68, 17.60
    
    # 2. Approximate degrees equivalent to 1 km at ~17.4 degrees Latitude
    # 1 degree lat ≈ 111 km. 1 degree lon ≈ 111 * cos(lat) ≈ 105.8 km
    delta_lat = 1.0 / 111.0          # approx 0.00901 degrees
    delta_lon = 1.0 / 105.8          # approx 0.00945 degrees
    
    lon_intervals = np.arange(min_lon, max_lon, delta_lon)
    lat_intervals = np.arange(min_lat, max_lat, delta_lat)
    
    polygons = []
    grid_ids = []
    cell_idx = 0
    
    # 3. Create the bounding box grid mesh
    for i in range(len(lon_intervals) - 1):
        for j in range(len(lat_intervals) - 1):
            x1, x2 = lon_intervals[i], lon_intervals[i+1]
            y1, y2 = lat_intervals[j], lat_intervals[j+1]
            
            # Construct polygon coordinates clockwise
            poly = Polygon([(x1, y1), (x1, y2), (x2, y2), (x2, y1), (x1, y1)])
            polygons.append(poly)
            
            grid_ids.append(f"GRID_{cell_idx:04d}")
            cell_idx += 1
            
    # 4. Wrap into a GeoDataFrame with EPSG:4326 Coordinate System
    gdf = gpd.GeoDataFrame({
        'grid_id': grid_ids,
        'geometry': polygons
    }, crs="EPSG:4326")
    
    # 5. Create the output folder if it doesn't exist and save
    output_dir = os.path.join("geospatial", "geo_data")
    os.makedirs(output_dir, exist_ok=True)
    
    output_path = os.path.join(output_dir, "hyderabad_grid.geojson")
    gdf.to_file(output_path, driver="GeoJSON")
    
    print(f"Success! Generated {len(gdf)} grid blocks.")
    print(f"Saved mesh configuration to: {output_path}")

if __name__ == "__main__":
    generate_hyderabad_grid()