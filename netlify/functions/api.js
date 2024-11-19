// api.js

const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
require('dotenv').config();

const app = express();
const api = express();

// Updated CORS configuration
api.use(cors({
  origin: true, // Allows all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Accept',
    'Accept-Language',
    'Authorization',
    'X-Requested-With'
  ],
  optionsSuccessStatus: 204,
  preflightContinue: false
}));

// Add OPTIONS handler for preflight requests
api.options('*', cors());

api.use(express.json());

// Helper functions for workspace analysis
const calculateWorkStyleScores = (place) => {
  const scores = {
    focus: 0,
    group: 0,
    calls: 0,
    casual: 0
  };

  // Parse key metrics
  const noise = String(place.noise_level || place.noise || '').toLowerCase();
  const wifiSpeed = place.wifi?.speed || 
    (place.download ? parseInt(place.download) : 0);
  const hasPower = place.power?.toLowerCase().includes('range3') || 
    place.power?.toLowerCase().includes('good');
  const hasFood = place.features?.hasFood;
  const hasCoffee = place.features?.hasCoffee;
  const hasOutdoor = place.features?.hasOutdoor;
  const type = String(place.type || '').toLowerCase();

  // Focus Score (max 10)
  scores.focus += noise.includes('quiet') ? 4 :
                 noise.includes('moderate') ? 2 : 0;
  scores.focus += hasPower ? 3 : 0;
  scores.focus += wifiSpeed >= 25 ? 3 : 
                 wifiSpeed >= 10 ? 2 : 0;
  // Type bonus
  scores.focus += type.includes('library') ? 2 :
                 type.includes('coworking') ? 1 : 0;

  // Group Score (max 10)
  scores.group += hasFood ? 3 : 0;
  scores.group += hasCoffee ? 2 : 0;
  scores.group += hasOutdoor ? 2 : 0;
  scores.group += (noise.includes('moderate') || noise.includes('lively')) ? 3 : 0;
  // Type bonus
  scores.group += type.includes('coworking') ? 2 :
                 type.includes('cafe') ? 1 : 0;

  // Calls Score (max 10)
  scores.calls += wifiSpeed >= 50 ? 4 :
                 wifiSpeed >= 25 ? 3 : 0;
  scores.calls += noise.includes('quiet') ? 4 :
                 noise.includes('moderate') ? 2 : 0;
  scores.calls += hasPower ? 2 : 0;
  // Type bonus
  scores.calls += type.includes('coworking') ? 2 :
                 type.includes('library') ? 1 : 0;

  // Casual Score (max 10)
  scores.casual += hasCoffee ? 3 : 0;
  scores.casual += hasFood ? 2 : 0;
  scores.casual += hasOutdoor ? 3 : 0;
  scores.casual += noise.includes('moderate') ? 2 : 
                  noise.includes('lively') ? 1 : 0;
  // Type bonus
  scores.casual += type.includes('cafe') ? 2 :
                  type.includes('coworking') ? 1 : 0;

  // Normalize scores to ensure they don't exceed 10
  Object.keys(scores).forEach(key => {
    scores[key] = Math.min(10, Math.round(scores[key]));
  });

  return scores;
};

const generateWorkStyleInsights = (place, scores) => {
  const insights = {};
  const noise = String(place.noise_level || place.noise || '').toLowerCase();
  const wifiSpeed = place.wifi?.speed || (place.download ? parseInt(place.download) : 0);
  const type = String(place.type || '').toLowerCase();

  // Focus Insights
  if (scores.focus >= 8) {
    insights.focus = {
      description: "Excellent environment for focused work",
      recommendations: [
        "Ideal for deep work sessions",
        "Good power access for long sessions",
        noise.includes('quiet') ? "Consistently quiet environment" : "Find a quiet corner"
      ],
      best_times: "Early mornings or late afternoons"
    };
  } else if (scores.focus >= 6) {
    insights.focus = {
      description: "Good for focused work during quieter hours",
      recommendations: [
        "Consider bringing noise-canceling headphones",
        "Best during off-peak hours",
        "Choose a secluded spot"
      ],
      best_times: "Before 10am or after 2pm"
    };
  } else {
    insights.focus = {
      description: "Better suited for casual work than deep focus",
      recommendations: [
        "Short focus sessions only",
        "Bring headphones",
        "Consider alternative locations for deep work"
      ],
      best_times: "Early mornings"
    };
  }

  // Group Work Insights
  if (scores.group >= 8) {
    insights.group = {
      description: "Perfect for team collaboration",
      recommendations: [
        "Ample space for groups",
        place.features?.hasFood ? "Food available for longer sessions" : "Consider food options",
        "Good mix of seating options"
      ],
      best_times: "Mid-morning to afternoon"
    };
  } else if (scores.group >= 6) {
    insights.group = {
      description: "Suitable for small group work",
      recommendations: [
        "Best for smaller teams",
        "Consider peak hours",
        "Check ahead for space availability"
      ],
      best_times: "Varied, check location"
    };
  } else {
    insights.group = {
      description: "Limited options for group work",
      recommendations: [
        "Better for pairs than larger groups",
        "Consider alternative locations for teams",
        "Check ahead for availability"
      ],
      best_times: "Off-peak hours only"
    };
  }

  // Calls Insights
  if (scores.calls >= 8) {
    insights.calls = {
      description: "Excellent for video calls and virtual meetings",
      recommendations: [
        wifiSpeed >= 50 ? "Strong WiFi for video calls" : "Good WiFi available",
        "Multiple quiet areas available",
        "Power access for longer sessions"
      ],
      best_times: "Any time during business hours"
    };
  } else if (scores.calls >= 6) {
    insights.calls = {
      description: "Can accommodate video calls with planning",
      recommendations: [
        "Test WiFi before important calls",
        "Scout quiet areas in advance",
        "Consider peak hours"
      ],
      best_times: "Off-peak hours recommended"
    };
  } else {
    insights.calls = {
      description: "Not ideal for important calls",
      recommendations: [
        "Emergency calls only",
        "Consider alternative locations",
        "Very short calls if necessary"
      ],
      best_times: "Early morning or late afternoon"
    };
  }

  // Casual Work Insights
  if (scores.casual >= 8) {
    insights.casual = {
      description: "Perfect for casual remote work",
      recommendations: [
        "Great atmosphere for light work",
        place.features?.hasOutdoor ? "Outdoor seating available" : "Comfortable seating",
        "Multiple amenities available"
      ],
      best_times: "Flexible throughout the day"
    };
  } else if (scores.casual >= 6) {
    insights.casual = {
      description: "Good spot for occasional remote work",
      recommendations: [
        "Suitable for shorter sessions",
        "Basic amenities available",
        "Check peak hours"
      ],
      best_times: "Varies by day"
    };
  } else {
    insights.casual = {
      description: "Limited amenities for casual work",
      recommendations: [
        "Short sessions only",
        "Basic amenities",
        "Consider alternatives"
      ],
      best_times: "Off-peak hours"
    };
  }

  return insights;
};

const generateContextualInsights = (places, context) => {
  const hour = context?.timeOfDay || new Date().getHours();
  const isWeekend = context?.dayOfWeek === 0 || context?.dayOfWeek === 6;

  // Calculate area-wide metrics
  const metrics = {
    avgWifiSpeed: places.reduce((sum, p) => sum + (p.wifi?.speed || 0), 0) / places.length,
    quietPlaces: places.filter(p => String(p.noise_level || p.noise || '').toLowerCase().includes('quiet')).length,
    highPowerPlaces: places.filter(p => p.power?.toLowerCase().includes('range3')).length
  };

  return {
    current_context: {
      summary: `${isWeekend ? 'Weekend' : 'Weekday'} ${
        hour < 12 ? 'morning' :
        hour < 17 ? 'afternoon' : 'evening'
      } availability`,
      crowd_level: hour < 10 ? "Generally quieter" :
                  hour < 14 ? "Peak hours" :
                  hour < 17 ? "Moderate" : "Varies by location",
      recommendations: [
        "Check individual locations for current conditions",
        hour >= 10 && hour <= 14 ? "Consider off-peak hours for focused work" : 
                                  "Good time for most work styles",
        isWeekend ? "Some locations may have limited hours" : 
                   "Regular weekday operations"
      ]
    },
    work_style_recommendations: {
      focus: {
        timing: "Early mornings or late afternoons",
        tips: [
          metrics.quietPlaces > places.length / 3 ? 
            "Multiple quiet locations available" : 
            "Limited quiet spaces - plan accordingly",
          "Bring headphones for background noise",
          metrics.highPowerPlaces > places.length / 2 ?
            "Good power access at most locations" :
            "Power access varies by location"
        ]
      },
      group: {
        timing: "Mid-morning to afternoon",
        tips: [
          "Call ahead for larger groups",
          isWeekend ? "Check weekend availability" : "Check peak hours",
          "Consider food and drink needs"
        ]
      },
      calls: {
        timing: metrics.avgWifiSpeed >= 25 ? 
          "Flexible throughout the day" : 
          "Off-peak hours recommended",
        tips: [
          metrics.avgWifiSpeed >= 50 ?
            "Strong WiFi available at several locations" :
            "WiFi strength varies - test before important calls",
          metrics.quietPlaces > 0 ?
            `${metrics.quietPlaces} quiet locations available` :
            "Limited quiet spaces - plan accordingly",
          "Have backup locations ready"
        ]
      },
      casual: {
        timing: "Flexible throughout the day",
        tips: [
          "Check individual location amenities",
          isWeekend ? "Verify weekend hours" : "Consider peak times for seating",
          "Multiple options available"
        ]
      }
    }
  };
};

// API Endpoints
api.get('/places/ll/:coords', async (req, res) => {
  try {
    const { coords } = req.params;
    const { radius = 2, rpp = 100, appid } = req.query;

    if (!appid) {
      return res.status(400).json({
        meta: { 
          code: 400, 
          error_type: 'missing_parameter',
          error_detail: 'Missing required appid parameter' 
        }
      });
    }

    if (!coords.match(/^-?\d+\.?\d*,-?\d+\.?\d*$/)) {
      return res.status(400).json({
        meta: { 
          code: 400, 
          error_type: 'invalid_coordinates',
          error_detail: 'Invalid coordinates format' 
        }
      });
    }

    const WORKFROM_API_URL = `https://workfrom.co/api/places/ll/${coords}`;
    
    const response = await fetch(
      `${WORKFROM_API_URL}?radius=${radius}&appid=${appid}&rpp=${rpp}`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json({
        meta: {
          code: response.status,
          error_type: 'api_error',
          error_detail: data.meta?.error || 'Failed to fetch places'
        }
      });
    }

    return res.json(data);
  } catch (error) {
    console.error('Places API error:', error);
    return res.status(500).json({
      meta: {
        code: 500,
        error_type: 'server_error',
        error_detail: 'An unexpected error occurred'
      }
    });
  }
});

api.get('/places/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { appid } = req.query;

    if (!appid) {
      return res.status(400).json({
        meta: { 
          code: 400, 
          error_type: 'missing_parameter',
          error_detail: 'Missing required appid parameter' 
        }
      });
    }

    const WORKFROM_API_URL = `https://workfrom.co/api/places/${id}`;
    
    const response = await fetch(
      `${WORKFROM_API_URL}?appid=${appid}`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        meta: {
          code: response.status,
          error_type: 'api_error',
          error_detail: data.meta?.error || 'Failed to fetch place details'
        }
      });
    }

    return res.json(data);
  } catch (error) {
    console.error('Place details API error:', error);
    return res.status(500).json({
      meta: {
        code: 500,
        error_type: 'server_error',
        error_detail: 'An unexpected error occurred'
      }
    });
  }
});

api.all('/analyze-workspaces', async (req, res) => {
  try {
    const { appid } = req.query;
    
    if (!appid) {
      return res.status(400).json({
        meta: { 
          code: 400, 
          error_type: 'missing_parameter',
          error_detail: 'Missing required appid parameter' 
        }
      });
    }

    // For POST requests, expect places data in body
    const places = req.method === 'POST' ? req.body?.places : [];
    const context = req.method === 'POST' ? req.body?.context : {
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay()
    };

    if (!Array.isArray(places) || places.length === 0) {
      return res.status(400).json({
        meta: { 
          code: 400, 
          error_type: 'invalid_request',
          error_detail: 'Please provide an array of places to analyze' 
        }
      });
    }

    const placeInsights = places.map(place => {
      const scores = calculateWorkStyleScores(place);
      const insights = generateWorkStyleInsights(place, scores);

      return {
        id: place.id,
        scores,
        insights,
        best_times: {
          focus: "Early mornings (7-10am)",
          group: "Late mornings to afternoons (10am-4pm)",
          calls: "Off-peak hours",
          casual: "Anytime during business hours"
        },
        crowd_levels: {
          morning: "Usually quieter",
          afternoon: "Moderate to busy",
          evening: "Varies by location"
        }
      };
    });

    const contextualInsights = generateContextualInsights(places, context);

    return res.json({
      meta: { code: 200 },
      insights: {
        places: placeInsights,
        context: contextualInsights
      }
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({
      meta: {
        code: 500,
        error_type: 'analysis_failed',
        error_detail: error.message || 'Unable to analyze workspaces. Please try again.'
      }
    });
  }
});

// Helper function to calculate area-wide metrics
const calculateAreaMetrics = (places) => {
  const metrics = {
    total_places: places.length,
    wifi_metrics: {
      high_speed: 0,    // 50+ Mbps
      moderate: 0,      // 25-50 Mbps
      basic: 0,         // <25 Mbps
      no_wifi: 0,
      avg_speed: 0
    },
    noise_levels: {
      quiet: 0,
      moderate: 0,
      lively: 0,
      unknown: 0
    },
    power_availability: {
      abundant: 0,      // range3
      moderate: 0,      // range2
      limited: 0,       // range1
      none: 0
    },
    amenities: {
      coffee: 0,
      food: 0,
      outdoor: 0
    },
    types: {
      cafe: 0,
      coworking: 0,
      library: 0,
      other: 0
    }
  };

  let totalWifiSpeed = 0;
  let placesWithWifi = 0;

  places.forEach(place => {
    // WiFi analysis
    if (place.no_wifi === "1") {
      metrics.wifi_metrics.no_wifi++;
    } else if (place.download) {
      const speed = parseInt(place.download);
      totalWifiSpeed += speed;
      placesWithWifi++;
      
      if (speed >= 50) metrics.wifi_metrics.high_speed++;
      else if (speed >= 25) metrics.wifi_metrics.moderate++;
      else metrics.wifi_metrics.basic++;
    }

    // Noise level analysis
    const noise = String(place.noise_level || place.noise || '').toLowerCase();
    if (noise.includes('quiet')) metrics.noise_levels.quiet++;
    else if (noise.includes('moderate')) metrics.noise_levels.moderate++;
    else if (noise.includes('noisy') || noise.includes('lively')) metrics.noise_levels.lively++;
    else metrics.noise_levels.unknown++;

    // Power availability analysis
    const power = String(place.power || '').toLowerCase();
    if (power.includes('range3') || power.includes('good')) metrics.power_availability.abundant++;
    else if (power.includes('range2')) metrics.power_availability.moderate++;
    else if (power.includes('range1')) metrics.power_availability.limited++;
    else metrics.power_availability.none++;

    // Amenities analysis
    if (place.coffee === "1") metrics.amenities.coffee++;
    if (place.food === "1") metrics.amenities.food++;
    if (place.outdoor_seating === "1" || place.outside === "1") metrics.amenities.outdoor++;

    // Type analysis
    const type = String(place.type || '').toLowerCase();
    if (type.includes('cafe') || type.includes('coffee')) metrics.types.cafe++;
    else if (type.includes('coworking')) metrics.types.coworking++;
    else if (type.includes('library')) metrics.types.library++;
    else metrics.types.other++;
  });

  // Calculate average WiFi speed
  metrics.wifi_metrics.avg_speed = placesWithWifi ? 
    Math.round(totalWifiSpeed / placesWithWifi) : 0;

  // Calculate percentages
  const addPercentages = (category) => {
    const total = Object.values(metrics[category]).reduce((sum, val) => sum + val, 0);
    Object.keys(metrics[category]).forEach(key => {
      if (key !== 'avg_speed') { // Skip avg_speed for wifi_metrics
        metrics[category][`${key}_pct`] = total ? 
          Math.round((metrics[category][key] / total) * 100) : 0;
      }
    });
  };

  addPercentages('wifi_metrics');
  addPercentages('noise_levels');
  addPercentages('power_availability');
  addPercentages('amenities');
  addPercentages('types');

  return metrics;
};

// Helper route to check API health
api.get('/health', (req, res) => {
  res.json({
    meta: { 
      code: 200,
      status: 'healthy',
      version: '1.0.0'
    }
  });
});

// Error handling middleware
api.use((err, req, res, next) => {
  console.error('API Error:', err);
  
  // Handle specific error types
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      meta: {
        code: 400,
        error_type: 'invalid_json',
        error_detail: 'Invalid JSON in request body'
      }
    });
  }

  // Handle payload size errors
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      meta: {
        code: 413,
        error_type: 'payload_too_large',
        error_detail: 'Request payload is too large'
      }
    });
  }

  // Default error response
  res.status(500).json({
    meta: {
      code: 500,
      error_type: 'server_error',
      error_detail: err.message || 'An unexpected error occurred'
    }
  });
});

app.use('/.netlify/functions/api', api);
module.exports.handler = serverless(app);