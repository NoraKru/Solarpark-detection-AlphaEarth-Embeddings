# Solarpark-detection-AlphaEarth-Embeddings
Solar panel detection in Lower and Middle Franconia using Google Earth Engine and Satellite Embeddings

In 2025, the Alpha Earth Foundation released a new AI-driven model for Earth observation. By projecting vast amounts of multi-source data into a 64-dimensional vector space (embeddings), this model opens up new dimensions for analyzing the Earth's surface. However, there are inherent limitations: the data is currently aggregated on an annual basis within Google Earth Engine, meaning short-term events like floods cannot be detected. Furthermore, the spatial coverage is not yet global; for instance, offshore wind farms in the North Sea are not yet included.

This project was driven by curiosity: **How effective are these AI embeddings for detecting solar photovoltaic (PV) parks in Lower and Middle Franconia using a Similarity Analysis approach?**

## Methodology

The initial similarity analysis often resulted in fragmented polygons, especially within larger solar parks where rows of panels are separated by grass or paths. To transform these raw detections into meaningful "objects," the following spatial refinement was implemented:

Buffering: All detected polygons were buffered by 500 meters.

Dissolving (Union): Overlapping buffers were merged to ensure that fragmented parts of the same facility are treated as a single entity.

Centroid Extraction: Finally, the geometric centers (centroids) were calculated for each cluster.

The end result is a streamlined point dataset representing the locations of detected solar energy sites. For validation, Ground Truth Data was obtained from the Energieatlas Bayern and integrated into a GIS environment for spatial comparison.

## Results and Discussion

## How to use
The script is designed for immediate use within Google Earth Engine (GEE):

Quick Start: Copy the code into the GEE Editor and click Run.

Custom Samples: If you wish to use your own training data, simply comment out or delete the samples definition block and create your own FeatureCollection of points.

<small>This workflow can be adapted to detect other objects (e.g., industrial sites or specific agricultural patterns) by simply changing the input samples and the region of interest.<small>
