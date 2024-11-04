const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const { OpenAI } = require('openai');
const moment = require('moment-timezone');
require('dotenv').config();

// Initialize Express app
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
        message: 'Please provide places to analyze'
      });
    }

    const timezone = getCityTimezone(places[0]?.city, places[0]?.state);
    const localTime = moment().tz(timezone);
    const timeContext = getTimeContext(localTime);
    const dayType = localTime.day() >= 1 && localTime.day() <= 5 ? 'workday' : 'weekend';

    const prompt = `As a local remote worker, recommend the best workspace for ${timeContext} (${localTime.format('h:mm A')}) on this ${dayType} in ${places[0].city || 'the area'}.

Places to consider:
${places.map(place => `
${place.name}:
- ${place.distance} miles away
- Internet: ${place.wifi}
- Noise level: ${place.noise}
- Power outlets: ${place.power}
- Type: ${place.type}
- Overall score: ${place.workabilityScore}/10
- The extras: ${Object.entries(place.amenities)
  .filter(([_, value]) => value)
  .map(([key]) => key)
  .join(', ')}
`).join('\n')}

Consider:
- Current time: ${localTime.format('h:mm A')} (${timeContext} crowd levels)
- Day type: ${dayType}
- Local context: ${places[0].city || 'Area'} community

Please provide your response in JSON format:
{
  "recommendation": {
    "name": "The best spot",
    "lede": "A compelling two-sentence story about what makes this place special. Include specific details about the atmosphere and ideal use case.",
    "headline": "A single crisp sentence (max 12 words) highlighting the key benefit",
    "context": "One short sentence about why this works for ${timeContext}/${dayType}",
    "personalNote": "Optional: A specific tip or insight based on experience",
    "standoutFeatures": [
      {
        "category": "wifi/power/quiet/amenities",
        "description": "One short phrase, max 6-8 words"
      }
    ]
  }
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: [
        {
          role: "system",
          content: "You're a friendly local remote worker who's spent countless hours working from these spaces. Provide recommendations in JSON format."
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
    
    res.json({
      insights: {
        recommendation: {
          name: places[0].name,
          headline: analysis.recommendation?.headline || "Great workspace for remote work",
          lede: analysis.recommendation?.lede || "This space offers an ideal environment for focused work.",
          context: analysis.recommendation?.context,
          personalNote: analysis.recommendation?.personalNote,
          standoutFeatures: analysis.recommendation?.standoutFeatures || []
        }
      },
      meta: {
        timezone,
        localTime: localTime.format(),
        timeContext,
        dayType
      }
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      message: 'Failed to analyze workspaces',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Mount the router
app.use('/.netlify/functions/api', router);

// Export the handler
module.exports = {
  handler: serverless(app)
};