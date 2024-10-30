// netlify/functions/api.js
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

// Default API key if not provided in request
const DEFAULT_API_KEY = 'RxhYNXu8CyPavHhO';

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log('Request details:', {
    method: req.method,
    originalUrl: req.originalUrl,
    path: req.path,
    baseUrl: req.baseUrl,
    params: req.params,
    url: req.url
  });
  next();
});

// Health check endpoint
router.get('/health', (req, res) => {
  console.log('Health check endpoint hit');
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    openaiKeyConfigured: !!process.env.OPENAI_API_KEY
  });
});

// Helper function to get timezone from city/state
// Timezone mapping helper
const getCityTimezone = (city = '', state = '') => {
  const location = `${city} ${state}`.toLowerCase();
  
  // US timezone mappings
  const timezones = {
    'america/los_angeles': [
      'portland', 'oregon', 'seattle', 'washington',
      'los angeles', 'san francisco', 'california'
    ],
    'america/denver': ['denver', 'colorado', 'salt lake city', 'utah'],
    'america/chicago': ['chicago', 'illinois', 'houston', 'texas'],
    'america/new_york': ['new york', 'boston', 'philadelphia']
  };

  for (const [timezone, cities] of Object.entries(timezones)) {
    if (cities.some(city => location.includes(city))) {
      return timezone;
    }
  }

  // Default to Eastern Time if no match
  return 'America/New_York';
};

// Get time-appropriate description
const getTimeContext = (moment) => {
  const hour = moment.hour();
  if (hour < 6) return "early morning";
  if (hour < 12) return "morning";
  if (hour < 14) return "lunch hour";
  if (hour < 17) return "afternoon";
  if (hour < 20) return "evening";
  return "night";
};

// Places endpoint
app.get('/api/places/ll/:coords', async (req, res) => {
  try {
    const { coords } = req.params;
    const radius = req.query.radius || 2;
    const rpp = req.query.rpp || 100;
    const appid = req.query.appid || DEFAULT_API_KEY;

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

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Workfrom API error: ${data.meta?.message || response.statusText}`);
    }

    res.json(data);
  } catch (error) {
    console.error('Places API error:', error);
    res.status(500).json({
      meta: {
        code: 500,
        error: 'Failed to fetch places',
        details: error.message
      },
      response: null
    });
  }
});

// Place details endpoint
app.get('/api/places/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const appid = req.query.appid || DEFAULT_API_KEY;

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
    if (!response.ok) {
      throw new Error(`Workfrom API error: ${data.meta?.message || response.statusText}`);
    }

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
app.post('/api/analyze-workspaces', async (req, res) => {
  try {
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

    const prompt = `Hey there! I'm a local remote worker who knows these spots inside and out. 
    Let me help you find the perfect workspace for ${timeContext} (${localTime.format('h:mm A')}) on this ${dayType} in ${places[0].city || 'your area'}.

    I've checked out these places recently:
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
    - Current time: ${localTime.format('h:mm A')} (typical ${timeContext} crowd levels)
    - Day type: ${dayType} (affects workspace atmosphere)
    - Local context: ${places[0].city || 'Area'} community vibe

    Please provide your response in JSON format with the following structure:
    {
      "recommendation": {
        "name": "The spot you'd recommend to a friend",
        "personalNote": "Share what makes this perfect for ${timeContext} on a ${dayType} - mention typical crowds, atmosphere, and local context (2-3 conversational sentences)",
        "standoutFeatures": [
          {
            "category": "wifi/power/quiet/amenities",
            "title": "What makes this feature special",
            "description": "The real deal about this feature, like you're telling a friend"
          }
        ],
        "finalNote": "A friendly wrap-up that helps them feel confident about trying this place"
      }
    }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: [
        {
          role: "system",
          content: "You're a friendly local remote worker who's spent countless hours working from these spaces. Your task is to provide recommendations in JSON format. Your response must be a valid JSON object that matches the specified structure. Keep the content authentic and personal while maintaining proper JSON syntax."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(completion.choices[0].message.content);
    
    res.json({
      insights: analysis,
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
      detail: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

app.use('/.netlify/functions/api', router);

exports.handler = serverless(app);