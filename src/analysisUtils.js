// analysisUtils.js

export const calculateWorkspaceMetrics = (places) => {
  const metrics = {
    averageWifiSpeed: 0,
    powerAvailability: 0,
    noiseDistribution: {
      quiet: 0,
      moderate: 0,
      noisy: 0
    },
    amenityCoverage: 0
  };

  places.forEach(place => {
    // WiFi Speed
    if (place.wifi && !isNaN(parseInt(place.wifi))) {
      metrics.averageWifiSpeed += parseInt(place.wifi);
    }

    // Power Availability
    if (place.power?.includes('range3')) {
      metrics.powerAvailability += 1;
    } else if (place.power?.includes('range2')) {
      metrics.powerAvailability += 0.7;
    } else if (place.power?.includes('range1')) {
      metrics.powerAvailability += 0.3;
    }

    // Noise Distribution
    const noise = place.noise.toLowerCase();
    if (noise.includes('quiet') || noise.includes('low')) {
      metrics.noiseDistribution.quiet += 1;
    } else if (noise.includes('moderate') || noise.includes('average')) {
      metrics.noiseDistribution.moderate += 1;
    } else if (noise.includes('noisy') || noise.includes('high')) {
      metrics.noiseDistribution.noisy += 1;
    }

    // Amenity Coverage
    let amenityCount = 0;
    if (place.amenities.coffee) amenityCount++;
    if (place.amenities.food) amenityCount++;
    if (place.amenities.alcohol) amenityCount++;
    if (place.amenities.outdoorSeating) amenityCount++;
    metrics.amenityCoverage += amenityCount / 4; // Normalize to 0-1
  });

  // Normalize metrics
  metrics.averageWifiSpeed = Math.round(metrics.averageWifiSpeed / places.length);
  metrics.powerAvailability = Math.round((metrics.powerAvailability / places.length) * 100);
  metrics.amenityCoverage = Math.round((metrics.amenityCoverage / places.length) * 100);

  return metrics;
};

export const determineTopPatterns = (places) => {
  const patterns = [];

  // Analyze WiFi patterns
  const highSpeedCount = places.filter(p => 
    p.wifi && parseInt(p.wifi) >= 50
  ).length;
  
  if (highSpeedCount / places.length >= 0.7) {
    patterns.push({
      type: 'connectivity',
      description: 'Strong presence of high-speed internet options'
    });
  }

  // Analyze workspace type patterns
  const types = places.reduce((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {});

  const dominantType = Object.entries(types)
    .sort(([,a], [,b]) => b - a)[0];

  if (dominantType[1] / places.length >= 0.5) {
    patterns.push({
      type: 'environment',
      description: `Predominant workspace type: ${dominantType[0]}`
    });
  }

  // Analyze amenity patterns
  const fullServiceCount = places.filter(p => 
    p.amenities.coffee && p.amenities.food
  ).length;

  if (fullServiceCount / places.length >= 0.6) {
    patterns.push({
      type: 'amenities',
      description: 'High availability of full-service workspaces'
    });
  }

  return patterns;
};

export const generateStrategicInsights = (places, metrics) => {
  const insights = [];
  const patterns = determineTopPatterns(places);

  // Generate core insights
  patterns.forEach(pattern => {
    insights.push({
      title: `${pattern.type.charAt(0).toUpperCase() + pattern.type.slice(1)} Trend`,
      description: pattern.description,
      category: pattern.type,
      importance: 4
    });
  });

  // Add comparative insights
  if (places.length >= 3) {
    const topWorkability = places.sort((a, b) => b.workabilityScore - a.workabilityScore)[0];
    insights.push({
      title: 'Optimal Workspace Profile',
      description: `${topWorkability.name} exemplifies the ideal balance of amenities and environment in this area`,
      category: 'productivity',
      importance: 5
    });
  }

  return insights;
};