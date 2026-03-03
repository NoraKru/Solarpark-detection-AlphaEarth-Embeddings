/*
 * PROJECT: Similarity Search for Solar Parks
 * METHOD: Euclidean Distance
 * REGION: Bavaria, Lower Franconia and Middle Franconia
 */


// --- SECTION 1: LOWER FRANCONIA (UNTERFRANKEN) ---

// 1.1 Define Area of Interest (AOI)
var aoiUnterfranken = ee.FeatureCollection('FAO/GAUL_SIMPLIFIED_500m/2015/level2')
  .filter(ee.Filter.eq('ADM2_NAME', 'Unterfranken'));
  
var geomUnter = aoiUnterfranken.geometry();
Map.centerObject(geomUnter, 9);
Map.addLayer(geomUnter, {color: 'red'}, 'Search Area: Lower Franconia');
Map.setOptions('SATELLITE');

// 1.2 Load AlphaEarth Embeddings (Baseline Year 2024)
var year = 2024;
var startDate = ee.Date.fromYMD(year, 1, 1);
var endDate = startDate.advance(1, 'year');

var embeddings = ee.ImageCollection('GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL');
var mosaic = embeddings
  .filter(ee.Filter.date(startDate, endDate))
  .mosaic();

// 1.3 Similarity Search Logic
var scale = 40;
var bandNames = mosaic.bandNames();

print('Meine Punkte:', samples);
print('Meine Punkte:', samples2);
//Collect manually Samples or use his ones:
var samples = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point([10.225648451251415, 50.20718751183858]), {label: 'Solar'}),
  ee.Feature(ee.Geometry.Point([10.246176770816842, 50.18304016601851]), {label: 'Solar'}),
  ee.Feature(ee.Geometry.Point([9.587343982597382, 49.80449869879423]), {label: 'Solar'}),
  ee.Feature(ee.Geometry.Point([9.472013452981072, 49.79543644158819]), {label: 'Solar'}),
  ee.Feature(ee.Geometry.Point([9.700636644008588, 49.98457642834476]), {label: 'Solar'}),
  ee.Feature(ee.Geometry.Point([10.26876125605955, 49.98391150216355]), {label: 'Solar'}),
  ee.Feature(ee.Geometry.Point([10.464678812041903, 50.00310642912673]), {label: 'Solar'})
]);

// Extract embedding vectors from reference samples (Ensure 'samples' is defined in Imports)
var sampleEmbeddings = mosaic.sampleRegions({
  collection: samples,
  scale: scale
});

// Compute dot product (Similarity) between reference vectors and the map
var sampleDistances = ee.ImageCollection(sampleEmbeddings.map(function(f) {
  var arrayImage = ee.Image(f.toArray(bandNames)).arrayFlatten([bandNames]);
  return arrayImage.multiply(mosaic).reduce('sum').rename('similarity');
}));

var meanDistanceUnter = sampleDistances.mean();

// 1.4 Visualisation & Classification
var similarityVis = {
  palette: ['000004', '2C105C', '711F81', 'B63679', 'EE605E', 'FDAE78', 'FCFDBF', 'FFFFFF'], 
  min: 0.8, 
  max: 1
};

Map.addLayer(meanDistanceUnter.clip(geomUnter), similarityVis, 'Similarity Map (Lower Franconia)', false);

// Apply Threshold & Vectorize
var threshold = 0.90;
var polygonsUnter = meanDistanceUnter.gt(threshold).selfMask().reduceToVectors({
  scale: scale,
  geometry: geomUnter,
  maxPixels: 1e10,
  tileScale: 16
});

// Spatial Clustering (Buffer & Union) to consolidate nearby detections
var clusterDistance = 500; // Meters
var unitedGeomUnter = polygonsUnter.map(function(f) { return f.buffer(clusterDistance); }).union().geometry();

var predictedMatchesUnter = ee.FeatureCollection(unitedGeomUnter.geometries().map(function(g) {
  return ee.Feature(ee.Geometry(g).centroid({maxError: 1}));
}));

Map.addLayer(predictedMatchesUnter, {color: 'purple'}, 'Detected Solar Centers (Lower Franconia)');
Map.addLayer(unitedGeomUnter, {color: 'green', opacity: 0.3}, 'Buffer Zones (Lower Franconia)');

print('Detected Solar Parks in Lower Franconia:', predictedMatchesUnter.size());

// --- SECTION 2: MIDDLE FRANCONIA (MITTELFRANKEN) ---

// 2.1 Define Area of Interest (AOI)
var aoiMittelfranken = ee.FeatureCollection('FAO/GAUL_SIMPLIFIED_500m/2015/level2')
  .filter(ee.Filter.eq('ADM2_NAME', 'Mittelfranken'));
  
var geomMittel = aoiMittelfranken.geometry();
Map.addLayer(geomMittel, {color: 'blue'}, 'Search Area: Middle Franconia');

//Collect manually Samples or use his ones:
var samples2 = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point([10.629908103838414, 49.5563348428216]), {label: 'Solar'}),
  ee.Feature(ee.Geometry.Point([10.841882379463014, 49.44796309912538]), {label: 'Solar'}),
  ee.Feature(ee.Geometry.Point([10.446097342245592, 49.302553569379214]), {label: 'Solar'}),
  ee.Feature(ee.Geometry.Point([10.934322472477369, 49.221142836120684]), {label: 'Solar'}),
  ee.Feature(ee.Geometry.Point([10.564490798009455, 49.182841769168206]), {label: 'Solar'}),
  ee.Feature(ee.Geometry.Point([10.801672189671061, 49.04466837255123]), {label: 'Solar'}),
  ee.Feature(ee.Geometry.Point([10.848463447997542, 49.06639632189382]), {label: 'Solar'})
]);

// 2.2 Similarity Search (using 'samples2')
var sampleEmbeddings2 = mosaic.sampleRegions({
  collection: samples2,
  scale: scale
});

var sampleDistances2 = ee.ImageCollection(sampleEmbeddings2.map(function(f) {
  var arrayImage = ee.Image(f.toArray(bandNames)).arrayFlatten([bandNames]);
  return arrayImage.multiply(mosaic).reduce('sum').rename('similarity');
}));

var meanDistanceMittel = sampleDistances2.mean();
Map.addLayer(meanDistanceMittel.clip(geomMittel), similarityVis, 'Similarity Map (Middle Franconia)', false);

// 2.3 Threshold & Clustering
var polygonsMittel = meanDistanceMittel.gt(threshold).selfMask().reduceToVectors({
  scale: scale,
  geometry: geomMittel,
  maxPixels: 1e10,
  tileScale: 16
});

var unitedGeomMittel = polygonsMittel.map(function(f) { return f.buffer(clusterDistance); }).union().geometry();

var predictedMatchesMittel = ee.FeatureCollection(unitedGeomMittel.geometries().map(function(g) {
  return ee.Feature(ee.Geometry(g).centroid({maxError: 1}));
}));

Map.addLayer(predictedMatchesMittel, {color: 'magenta'}, 'Detected Solar Centers (Middle Franconia)');

print('Detected Solar Parks in Middle Franconia:', predictedMatchesMittel.size());

// --- SECTION 3: EXPORTS ---

Export.table.toDrive({
  collection: predictedMatchesUnter,
  description: 'Solar_Park_Detections_Lower_Franconia',
  fileFormat: 'SHP'
});

Export.table.toDrive({
  collection: predictedMatchesMittel,
  description: 'Solar_Park_Detections_Middle_Franconia',
  fileFormat: 'SHP'
});
