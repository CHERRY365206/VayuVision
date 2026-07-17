import ee

# Initialize Earth Engine
ee.Initialize(project="et-hackathon-502209")

print("Earth Engine initialized!")

# Load your uploaded 1 km grid
grid = ee.FeatureCollection(
    "projects/et-hackathon-502209/assets/hyderabad_grid_shapefile"
)

# Get the grid boundary
study_area = grid.geometry()

# Latest Sentinel-5P NO2 image
latest = (
    ee.ImageCollection("COPERNICUS/S5P/NRTI/L3_NO2")
    .filterBounds(study_area)
    .select("NO2_column_number_density")
    .sort("system:time_start", False)
    .first()
)

# Latest image date
date = ee.Date(latest.get("system:time_start")).format("YYYY-MM-dd")

print("Latest image date:", date.getInfo())

# Calculate mean NO2 for every grid cell
result = latest.reduceRegions(
    collection=grid,
    reducer=ee.Reducer.mean(),
    scale=1000
)

print("Number of grid cells:", result.size().getInfo())

# Export to Google Drive
task = ee.batch.Export.table.toDrive(
    collection=result,
    description="Hyderabad_NO2_Latest",
    folder="EarthEngine",
    fileNamePrefix="hyderabad_no2_latest",
    fileFormat="CSV"
)

task.start()

print("Export started successfully!")
print("Check the Tasks tab in the Earth Engine Code Editor.")