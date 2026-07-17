import ee

ee.Initialize(project="et-hackathon-502209")

print("Earth Engine initialized successfully!")

collection = ee.ImageCollection("COPERNICUS/S5P/NRTI/L3_NO2")

print("Number of images:", collection.size().getInfo())