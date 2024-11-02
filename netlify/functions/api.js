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

// LRU Cache Implementation
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
    this.expiryTimes = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    
    // Check expiry
    if (Date.now() > this.expiryTimes.get(key)) {
      this.cache.delete(key);
      this.expiryTimes.delete(key);
      return null;
    }
    
    // Refresh item by removing and adding back
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value, ttlMinutes = 60) {
    if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      this.expiryTimes.delete(firstKey);
    }
    this.cache.set(key, value);
    this.expiryTimes.set(key, Date.now() + (ttlMinutes * 60 * 1000));
  }
}

// Initialize cache with 100 items capacity
const analysisCache = new LRUCache(100);

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

// Generate cache key from places data and time context
const generateCacheKey = (places, timezone) => {
  const localTime = moment().tz(timezone);
  const timeContext = getTimeContext(localTime);
  const dayType = localTime.day() >= 1 && localTime.day() <= 5 ? 'workday' : 'weekend';
  
  const relevantData = {
    places: places.map(place => ({
      name: place.name,
      wifi: place.wifi,
      noise: place.noise,
      power: place.power,
      type: place.type,
      workabilityScore: place.workabilityScore,
      amenities: place.amenities
    })),
    timeContext,
    dayType,
    hour: localTime.hour()
  };
  
  return JSON.stringify(relevantData);
};

// Places endpoint - Fixed routing
app.get('*/places/ll/:coords', async (req, res) => {
  try {
    const { coords } = req.params;
    const radius = req.query.radius || 2;
    const rpp = req.query.rpp || 100;
    const appid = req.query.appid || DEFAULT_API_KEY;

    console.log('Places endpoint hit:', {
      coords,
      radius,
      rpp,
      appid
    });

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

// Place details endpoint - Fixed routing
app.get('*/places/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const appid = req.query.appid || DEFAULT_API_KEY;

    console.log('Place details endpoint hit:', {
      id,
      appid
    });

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

// Analyze workspaces endpoint with caching
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

    // Generate cache key including time context
    const cacheKey = generateCacheKey(places, timezone);
    
    // Check cache first
    const cachedAnalysis = analysisCache.get(cacheKey);
    if (cachedAnalysis) {
      console.log('Cache hit - returning cached analysis');
      return res.json({
        insights: cachedAnalysis,
        meta: {
          timezone,
          localTime: localTime.format(),
          timeContext,
          dayType
        },
        cached: true
      });
    }

    const prompt = `As a local remote worker, recommend the best workspace for ${timeContext} (${localTime.format('h:mm A')}) on this ${dayType} in ${places[0].city || 'your area'}.

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
        "headline": "A single crisp sentence (max 12 words) highlighting the key benefit",
        "context": "One short sentence about why this works for ${timeContext}/${dayType}",
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
          content: "You're a friendly local remote worker who's spent countless hours working from these spaces. Your task is to provide recommendations in JSON format. Your response must be a valid JSON object that matches the specified structure. Keep the content authentic and personal while maintaining proper JSON syntax."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7, // Slightly reduced for more consistent responses
      max_tokens: 800, // Optimized token limit
      response_format: { type: "json_object" },
      presence_penalty: 0.3, // Encourage focused responses
      frequency_penalty: 0.3 // Reduce repetition
    });

    const analysis = JSON.parse(completion.choices[0].message.content);
    
    // Cache the result
    analysisCache.set(cacheKey, analysis);
    
    res.json({
      insights: analysis,
      meta: {
        timezone,
        localTime: localTime.format(),
        timeContext,
        dayType
      },
      cached: false
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      message: 'Failed to analyze workspaces',
      detail: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Mount the router at both paths to handle both URL patterns
app.use('/.netlify/functions/api', router);
app.use('/api', router);

// Export the handler
exports.handler = serverless(app);