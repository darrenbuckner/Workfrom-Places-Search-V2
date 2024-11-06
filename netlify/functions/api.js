const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const { OpenAI } = require('openai');
const moment = require('moment-timezone');
require('dotenv').config();

// Initialize Express app and router
const app = express();
const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8888'
    ];
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Temporarily allow all origins for debugging
    }
  },
  credentials: true,
  optionsSuccessStatus: 204
};

// Apply middleware
app.use(cors(corsOptions));
app.use(express.json());

// Utility functions
const getCityTimezone = (city = '', state = '') => {
  const location = `${city || ''} ${state || ''}`.toLowerCase().trim();
  
  const timezones = {
    'America/Los_Angeles': [
      'portland', 'oregon', 'seattle', 'washington',
      'los angeles', 'san francisco', 'california',
      'mountain view', 'palo alto', 'san jose', 'oakland'
    ],
    'America/Denver': ['denver', 'colorado', 'salt lake city', 'utah'],
    'America/Chicago': ['chicago', 'illinois', 'houston', 'texas'],
    'America/New_York': ['new york', 'boston', 'philadelphia']
  };

  for (const [timezone, cities] of Object.entries(timezones)) {
    if (cities.some(city => location.includes(city))) {
      return timezone;
    }
  }

  return 'America/Los_Angeles';
};

const getTimeContext = (momentObj) => {
  const hour = momentObj.hour();
  if (hour < 6) return "early morning";
  if (hour < 12) return "morning";
  if (hour < 14) return "lunch hour";
  if (hour < 17) return "afternoon";
  if (hour < 20) return "evening";
  return "night";
};

// Debug middleware
router.use((req, res, next) => {
  console.log('Request received:', {
    method: req.method,
    path: req.path,
    params: req.params,
    query: req.query,
  });
  next();
});

// Places endpoint
router.get('/places/ll/:coords', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { coords } = req.params;
    const radius = req.query.radius || 2;
    const rpp = req.query.rpp || 100;
    const appid = req.query.appid || 'RxhYNXu8CyPavHhO';

    console.log('Processing request for coordinates:', coords);

    if (!coords.match(/^-?\d+\.?\d*,-?\d+\.?\d*$/)) {
      throw new Error('Invalid coordinates format');
    }

    const WORKFROM_API_URL = `https://api.workfrom.co/places/ll/${coords}`;
    
    const response = await fetch(
      `${WORKFROM_API_URL}?radius=${radius}&appid=${appid}&rpp=${rpp}`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Workfrom API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Add response time
    if (data.meta) {
      data.meta.responseTime = Date.now() - startTime;
    }

    res.json(data);
  } catch (error) {
    console.error('Places API error:', error);
    res.status(500).json({
      meta: {
        code: 500,
        error: error.message,
        responseTime: Date.now() - startTime
      },
      response: null
    });
  }
});

// Place details endpoint
router.get('/places/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const appid = req.query.appid || 'RxhYNXu8CyPavHhO';

    const WORKFROM_API_URL = `https://api.workfrom.co/places/${id}`;
    
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
    res.json(data);
  } catch (error) {
    console.error('Place details API error:', error);
    res.status(500).json({
      meta: {
        code: 500,
        error: 'Failed to fetch place details',
        details: error.message
      },
      response: null
    });
  }
});

// Analyze workspaces endpoint
router.post('/analyze-workspaces', async (req, res) => {
  try {
    console.log('Analyze workspaces endpoint hit');
    const { places } = req.body;
    
    if (!Array.isArray(places) || places.length === 0) {
      return res.status(400).json({ 
        meta: {
          code: 400,
          error: 'Please provide places to analyze'
        }
      });
    }

    const timezone = getCityTimezone(places[0]?.city, places[0]?.state);
    const localTime = moment().tz(timezone);
    const timeContext = getTimeContext(localTime);
    const dayType = localTime.day() >= 1 && localTime.day() <= 5 ? 'workday' : 'weekend';

    const prompt = `As a local creative professional and remote worker, analyze these nearby workspaces and recommend the best option for ${timeContext} (${localTime.format('h:mm A')}) on a ${dayType}. Consider both practical needs and atmosphere. Use commonlanguage and a tone that is casual and approachable.
    Places to analyze:
    ${places.map(place => `
    ${place.name}:
    - Distance: ${place.distance} miles
    - WiFi: ${place.wifi}
    - Noise: ${place.noise}
    - Power: ${place.power}
    - Type: ${place.type}
    - Workability: ${place.workabilityScore}/10
    - Available amenities: ${Object.entries(place.amenities)
      .filter(([_, value]) => value)
      .map(([key]) => key)
      .join(', ')}
    `).join('\n')}

    Context to consider:
    - Time of day: ${localTime.format('h:mm A')} (${timeContext})
    - Day type: ${dayType}
    - Location: ${places[0].city || 'Local area'}

    Provide your recommendation in this JSON format:
    {
      "recommendation": {
        "name": "(exact name of the best workspace)",
        "headline": "(one clear sentence about why this is the best choice - max 12 words)",
        "lede": "A compelling one-sentence story about what makes this place special. Include specific details about the atmosphere and ideal use case.",
        "personalNote": "(optional: a specific tip from your experience, max 20 words)",
        "standoutFeatures": [
          {
            "category": "(wifi/power/noise/amenities)",
            "description": "(specific detail about this feature, max 8 words)"
          }
        ]
      },
      "context": {
        "timeOfDay": "${timeContext}",
        "crowdLevel": "(expected crowd level: quiet/moderate/busy)",
        "bestFor": "(type of work: focused/collaborative/casual)"
      }
    }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: [
        {
          role: "system",
          content: "You are an experienced remote worker familiar with these workspaces. Provide practical, specific recommendations based on real workspace needs."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(completion.choices[0].message.content);
    
    // Find the full place data for the recommended workspace
    const recommendedPlace = places.find(p => p.name === analysis.recommendation.name);
    
    if (!recommendedPlace) {
      throw new Error('Recommended place not found in provided places');
    }

    res.json({
      meta: {
        code: 200,
        timezone,
        localTime: localTime.format(),
        timeContext,
        dayType
      },
      insights: {
        recommendation: {
          name: recommendedPlace.name,
          headline: analysis.recommendation.headline,
          lede: analysis.recommendation.lede,           // Add lede to response
          personalNote: analysis.recommendation.personalNote,
          standoutFeatures: analysis.recommendation.standoutFeatures
        },
        context: analysis.context
      }
    });
  } catch (error) {
    console.error('Analysis error:', error);
    
    // Provide a useful fallback response
    const fallbackPlace = places.reduce((best, current) => 
      current.workabilityScore > best.workabilityScore ? current : best
    , places[0]);

    res.status(200).json({
      meta: {
        code: 207,
        error: 'AI analysis unavailable, falling back to score-based recommendation',
        detail: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      insights: {
        recommendation: {
          name: fallbackPlace.name,
          headline: `Highest rated workspace with a ${fallbackPlace.workabilityScore}/10 workability score`,
          lede: `This workspace offers the highest overall workability score in the area. It's a reliable choice for remote work.`,  // Add fallback lede
          standoutFeatures: [/* ... */]
        },
        context: {/* ... */}
      }
    });
  }
});

// Mount the router and export the handler
app.use('/.netlify/functions/api', router);

module.exports.handler = serverless(app);