// netlify/functions/api.js
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const { OpenAI } = require('openai');
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

// Middleware
app.use(cors());
app.use(express.json());

// Path normalization middleware
router.use((req, res, next) => {
  if (req.path.startsWith('/.netlify/functions/api')) {
    req.url = req.url.replace('/.netlify/functions/api', '');
  }
  if (req.path.startsWith('/api')) {
    req.url = req.url.replace('/api', '');
  }
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

// Places endpoint
router.get('/places/ll/:coords', async (req, res) => {
  try {
    console.log('Places endpoint hit. Params:', req.params);
    const { coords } = req.params;
    const radius = req.query.radius || 2;
    const rpp = req.query.rpp || 100;
    const appid = req.query.appid || DEFAULT_API_KEY;

    const WORKFROM_API_URL = `https://api.workfrom.co/places/ll/${coords}`;
    
    console.log('Calling Workfrom API:', {
      url: WORKFROM_API_URL,
      params: { radius, appid, rpp }
    });
    
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

    console.log('Workfrom API response received:', {
      status: response.status,
      resultCount: data.response?.length
    });
    
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
router.get('/places/:id', async (req, res) => {
  try {
    console.log('Place details endpoint hit. Params:', req.params);
    const { id } = req.params;
    const appid = req.query.appid || DEFAULT_API_KEY;

    const WORKFROM_API_URL = `https://api.workfrom.co/places/${id}`;
    
    console.log('Calling Workfrom API:', {
      url: WORKFROM_API_URL,
      params: { appid }
    });

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
router.post('/analyze-workspaces', async (req, res) => {
  try {
    console.log('Analyze workspaces endpoint hit');
    const { places } = req.body;
    
    if (!Array.isArray(places) || places.length === 0) {
      return res.status(400).json({ 
        message: 'Please provide places to analyze'
      });
    }

    const prompt = `Hey there! I'm a local remote worker who knows these spots inside and out. 
    Let me help you find the perfect workspace that'll feel like your second home office.

    I've checked out these places recently:
    ${places.map((place, index) => `
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

    Please provide your response in JSON format. The response should be a valid JSON object with the following structure:
    {
      "recommendation": {
        "name": "The spot you'd recommend to a friend",
        "personalNote": "Share what it's really like working here - the vibe, the regulars, the hidden perks (2-3 conversational sentences)",
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
      insights: analysis
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      message: 'Failed to analyze workspaces',
      detail: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({
    meta: {
      code: 500,
      error: 'Internal server error'
    },
    response: null,
    detail: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Use the router
app.use(cors());
app.use(express.json());
app.use('/', router);
app.use('/.netlify/functions/api', router);

// Export the handler
exports.handler = serverless(app);