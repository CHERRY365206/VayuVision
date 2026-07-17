import os
import random
import folium
from folium.plugins import MarkerCluster # <--- We are importing the clustering engine!
import geopandas as gpd

def render_interactive_base_map():
    print("\n--- Starting Days 3 & 4: Base Map Visual Composition ---")
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    grid_path = os.path.join(current_dir, "geo_data", "hyderabad_grid.geojson")
    pois_path = os.path.join(current_dir, "geo_data", "urban_features.geojson")
    
    if not os.path.exists(grid_path) or not os.path.exists(pois_path):
        print("Missing required layers. Run Day 1 and Day 2 scripts first.")
        return
        
    print("Files located successfully! Rendering map with Marker Clustering...")
    
    # 1. Load data assets
    gdf_grid = gpd.read_file(grid_path)
    gdf_pois = gpd.read_file(pois_path)
    
    # 2. Set up map canvas centered on Hyderabad
    center_lat, center_lon = 17.40, 78.45
    m = folium.Map(location=[center_lat, center_lon], zoom_start=11, tiles="cartodbpositron")
    
    # 3. Simulate localized baseline readings for prototype validation
    aqi_values = {}
    for gid in gdf_grid['grid_id']:
        aqi_values[gid] = random.randint(40, 320)
        
    def assign_color(grid_id):
        val = aqi_values.get(grid_id, 0)
        if val <= 50: return "#00e400"      
        elif val <= 100: return "#ffff00"   
        elif val <= 200: return "#ff7e00"   
        elif val <= 300: return "#ff0000"   
        else: return "#7e0023"              

    # 4. Overlay the 1km Bounding Box Grid Layer
    grid_layer = folium.FeatureGroup(name="1km Forecast Grid Mesh", show=True)
    
    for _, row in gdf_grid.iterrows():
        geo_j = folium.GeoJson(
            row['geometry'],
            style_function=lambda x, gid=row['grid_id']: {
                'fillColor': assign_color(gid),
                'color': '#8c8c8c',
                'weight': 0.6,
                'fillOpacity': 0.3 # Slightly more transparent so pins pop more
            }
        )
        folium.Popup(f"<b>Grid Identifier:</b> {row['grid_id']}<br><b>Simulated AQI:</b> {aqi_values[row['grid_id']]}").add_to(geo_j)
        geo_j.add_to(grid_layer)
        
    grid_layer.add_to(m)
    
    # 5. Build Independent Marker Clusters
    # This keeps the map incredibly clean and allows turning specific categories on/off
    cluster_industry = MarkerCluster(name="🏭 Industrial Sources (Emission)")
    cluster_health = MarkerCluster(name="🏥 Healthcare (Vulnerable)")
    cluster_edu = MarkerCluster(name="🏫 Education (Vulnerable)")
    
    for _, row in gdf_pois.iterrows():
        centroid = row['geometry'].centroid
        lon, lat = centroid.x, centroid.y
        label = row['name'] if row['name'] else row['poi_type']
        
        # Sort the pins into their respective clusters using FontAwesome (fa) icons
        if row['poi_type'] == 'Industrial Source':
            folium.Marker(
                location=[lat, lon],
                popup=f"<b>Facility:</b> {label}<br><b>Type:</b> Emission Source",
                icon=folium.Icon(color='red', icon='industry', prefix='fa')
            ).add_to(cluster_industry)
            
        elif row['poi_type'] == 'Vulnerable - Healthcare':
            folium.Marker(
                location=[lat, lon],
                popup=f"<b>Facility:</b> {label}<br><b>Type:</b> Vulnerable Population",
                icon=folium.Icon(color='blue', icon='plus-square', prefix='fa')
            ).add_to(cluster_health)
            
        else: # Educational
            folium.Marker(
                location=[lat, lon],
                popup=f"<b>Facility:</b> {label}<br><b>Type:</b> Vulnerable Population",
                icon=folium.Icon(color='green', icon='graduation-cap', prefix='fa')
            ).add_to(cluster_edu)
            
    # Add the clusters to the map
    cluster_industry.add_to(m)
    cluster_health.add_to(m)
    cluster_edu.add_to(m)
    
    # Add the layer control panel
    folium.LayerControl(collapsed=False).add_to(m)
    
    # 6. Output compiled HTML component
    output_html_path = os.path.join(current_dir, "geo_data", "hyderabad_base_map.html")
    m.save(output_html_path)
    print("Success! Integrated Base Map Render Engine Is Operating.")
    print(f"Open this file in your browser to verify: {output_html_path}")

if __name__ == "__main__":
    render_interactive_base_map()