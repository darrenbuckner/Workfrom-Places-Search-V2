// api.js
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const { OpenAI } = require('openai');
const moment = require('moment-timezone');
require('dotenv').config();

const app = express();
const api = express();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// CORS configuration
api.use(cors({
  origin: true,
  credentials: true,
  optionsSuccessStatus: 204
}));

api.use(express.json());

// Places endpoint
api.get('/places/ll/:coords', async (req, res) => {
  try {
    const { coords } = req.params;
    const { radius = 2, rpp = 100, appid } = req.query;

    if (!appid) {
      return res.status(400).json({
        meta: { code: 400, error: 'Missing required appid parameter' }
      });
    }

    if (!coords.match(/^-?\d+\.?\d*,-?\d+\.?\d*$/)) {
      return res.status(400).json({
        meta: { code: 400, error: 'Invalid coordinates format' }
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
    
    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      meta: {
        code: 500,
        error: 'Failed to fetch places'
      }
    });
  }
});

// Place details endpoint
api.get('/places/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { appid } = req.query;

    if (!appid) {
      return res.status(400).json({
        meta: { code: 400, error: 'Missing required appid parameter' }
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
    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      meta: {
        code: 500,
        error: 'Failed to fetch place details'
      }
    });
  }
});

// Workspace analysis endpoint
api.post('/analyze-workspaces', async (req, res) => {
  try {
    const { places } = req.body;
    
    if (!places?.length) {
      return res.status(400).json({
        meta: { code: 400, error: 'Please provide places to analyze' }
      });
    }

    const timezone = getCityTimezone(places[0]?.city, places[0]?.state);
    const localTime = moment().tz(timezone);
    const timeContext = localTime.format('h:mm A');
    const dayType = localTime.day() >= 1 && localTime.day() <= 5 ? 'workday' : 'weekend';

    const prompt = `Analyze these workspaces for remote workers at ${timeContext} on a ${dayType}:

    Places:
    ${places.slice(0, 10).map(place => `
    ${place.name} (${place.type || 'Unknown type'})
    - Distance: ${place.distance}mi
    - WiFi: ${place.wifi || 'Unknown'}
    - Noise: ${place.noise || 'Unknown'}
    - Power: ${place.power || 'Unknown'}
    - Score: ${place.workabilityScore}/10
    - Amenities: ${Object.entries(place.amenities)
      .filter(([_, value]) => value)
      .map(([key]) => key)
      .join(', ')}
    `).join('\n')}

    Provide insights in this JSON format:
    {
      "insights": {
        "summary": {
          "best_time": "Current time assessment",
          "crowd_level": "Expected crowd levels",
          "current_context": "Key consideration for this time"
        },
        "featured_spot": {
          "place_name": "Name of most unique or interesting workspace",
          "highlight": "2-3 sentence creative description highlighting what makes this place special",
          "best_for": ["2-3 specific activities or purposes this place is perfect for"],
          "unique_features": ["2-3 standout features that make this place worth visiting"],
          "vibe": "One-word description of the atmosphere",
          "best_time_to_visit": "Ideal time to visit based on current analysis"
        },
        "recommendations": {
          "focus": {
            "place": "Best quiet workspace name",
            "why": "Reason for recommendation",
            "tips": ["3-4 specific tips"]
          },
          "collaboration": {
            "place": "Best team workspace name",
            "why": "Reason for recommendation",
            "tips": ["3-4 specific tips"]
          },
          "casual": {
            "place": "Best casual workspace name",
            "why": "Reason for recommendation",
            "tips": ["3-4 specific tips"]
          }
        }
      }
    }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content: "You are a workspace optimization expert providing practical, specific advice."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
      max_tokens: 1000
    });

    const analysis = JSON.parse(completion.choices[0].message.content);

    return res.json({
      meta: {
        code: 200,
        timestamp: new Date().toISOString(),
        timezone,
        timeContext,
        dayType
      },
      insights: analysis
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({
      meta: {
        code: 500,
        error: 'Analysis failed'
      }
    });
  }
});

// Helper function to get key highlights about a place
function getPlaceHighlight(place) {
  const highlights = [];
  
  if (place.wifi && place.wifi !== "Unknown" && place.no_wifi !== "1") {
    highlights.push("reliable wifi");
  }
  
  if (place.noise?.toLowerCase().includes('quiet')) {
    highlights.push("peaceful atmosphere");
  } else if (place.noise?.toLowerCase().includes('moderate')) {
    highlights.push("balanced energy");
  } else if (place.noise?.toLowerCase().includes('noisy')) {
    highlights.push("lively vibe");
  }

  if (place.amenities?.coffee) highlights.push("great coffee");
  if (place.amenities?.food) highlights.push("food options");
  if (place.amenities?.outdoorSeating) highlights.push("outdoor space");

  return highlights.length ? highlights.join(", ") : "flexible workspace";
}

// Helper function for timezone lookup
function getCityTimezone(city = '', state = '') {
  const location = `${city || ''} ${state || ''}`.toLowerCase().trim();
  
  const timezones = {
    'America/Los_Angeles': [
      'portland', 'seattle', 'los angeles', 'san francisco', 'california'
    ],
    'America/Denver': ['denver', 'salt lake city'],
    'America/Chicago': ['chicago', 'houston'],
    'America/New_York': ['new york', 'boston', 'philadelphia']
  };

  for (const [timezone, cities] of Object.entries(timezones)) {
    if (cities.some(city => location.includes(city))) {
      return timezone;
    }
  }

  return 'America/Los_Angeles';
}

app.use('/.netlify/functions/api', api);
module.exports.handler = serverless(app);