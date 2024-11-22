const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const { OpenAI } = require('openai');
const app = express();
const api = express();
require('dotenv').config();

const { OPENAI_API_KEY } = process.env;
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

// CORS configuration
api.use(cors({
  origin: true,
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

api.options('*', cors());
api.use(express.json());

// Cache configuration
const AI_CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours for AI-generated content
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour for general content
const aiInsightsCache = new Map();
const cache = new Map();

// Helper function to strip HTML
const stripHtml = (html) => {
  if (!html) return '';
  try {
    // Use a safer way to strip HTML without using DOM methods
    return html.replace(/<[^>]*>?/gm, '').trim();
  } catch (error) {
    console.error('Error stripping HTML:', error);
    return '';
  }
};

// Helper to determine if a description is meaningful
const isDescriptionMeaningful = (description) => {
  if (!description) return false;
  try {
    const cleaned = stripHtml(description).trim();
    if (cleaned.length < 50) return false;
    
    const genericPhrases = [
      'a place to work',
      'work from here',
      'get work done',
      'wifi available',
      'power outlets',
      'great place',
      'nice spot'
    ];
    
    const containsGenericPhraseOnly = genericPhrases.some(phrase => 
      cleaned.toLowerCase().includes(phrase) && 
      cleaned.length < phrase.length + 30
    );
    
    return !containsGenericPhraseOnly;
  } catch (error) {
    console.error('Error checking description:', error);
    return false;
  }
};

const checkOpenAIConfig = () => {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key is not configured');
    return false;
  }
  return true;
};

const parseUserDescription = async (description) => {
  if (!description || !OPENAI_API_KEY) return null;
  try {
    if (!isDescriptionMeaningful(description)) return null;

    const prompt = `
      Below is a user-submitted description of a workspace. Create a single, 
      concise sentence (max 20 words) that highlights the most unique or 
      helpful insight for remote workers.

      Focus only on specific, distinctive features rather than generic observations.
      If the description doesn't contain any unique or helpful insights, respond with null.

      User Description: "${stripHtml(description).trim()}"

      Respond ONLY with a JSON object in this exact format:
      {
        "userInsight": "<single insightful sentence or null>"
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You create concise, specific insights from workspace descriptions. Focus only on unique, helpful details that would matter to remote workers. Always respond in valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 150
      // Remove response_format parameter
    });

    try {
      const responseText = completion.choices[0].message.content;
      const parsedResponse = JSON.parse(responseText);
      return parsedResponse?.userInsight ? { userInsight: parsedResponse.userInsight } : null;
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      return null;
    }

  } catch (error) {
    console.error('Error parsing description:', error);
    return null;
  }
};

// Helper function to calculate work style scores
const calculateWorkStyleScores = (place) => {
  const scores = {
    focus: 0,
    group: 0,
    calls: 0,
    casual: 0
  };

  // Parse key metrics
  const noise = String(place.noise_level || place.noise || '').toLowerCase();
  const wifiSpeed = place.download ? parseInt(place.download) : 0;
  const powerValue = String(place.power || '').toLowerCase();
  const hasPower = powerValue.includes('range3') || powerValue.includes('range2');
  const hasFood = place.food === "1";
  const hasCoffee = place.coffee === "1";
  const hasOutdoor = place.outdoor_seating === "1" || place.outside === "1";
  const type = String(place.type || '').toLowerCase();

  // Focus Score
  if (noise.includes('quiet')) scores.focus += 4;
  else if (noise.includes('moderate')) scores.focus += 2;
  if (hasPower) scores.focus += 3;
  if (wifiSpeed >= 25) scores.focus += 3;
  else if (wifiSpeed >= 10) scores.focus += 2;
  if (type.includes('library')) scores.focus += 2;
  else if (type.includes('coworking')) scores.focus += 1;

  // Group Score
  if (hasFood) scores.group += 3;
  if (hasCoffee) scores.group += 2;
  if (hasOutdoor) scores.group += 2;
  if (noise.includes('moderate') || noise.includes('lively')) scores.group += 3;
  if (type.includes('coworking')) scores.group += 2;
  else if (type.includes('commercial')) scores.group += 1;
  if (hasPower) scores.group += 1;

  // Calls Score
  if (wifiSpeed >= 50) scores.calls += 4;
  else if (wifiSpeed >= 25) scores.calls += 3;
  if (noise.includes('quiet')) scores.calls += 4;
  else if (noise.includes('moderate')) scores.calls += 2;
  if (hasPower) scores.calls += 2;
  if (type.includes('coworking')) scores.calls += 2;
  else if (type.includes('library')) scores.calls += 1;

  // Casual Score
  if (hasCoffee) scores.casual += 3;
  if (hasFood) scores.casual += 2;
  if (hasOutdoor) scores.casual += 3;
  if (noise.includes('moderate')) scores.casual += 2;
  else if (noise.includes('lively')) scores.casual += 1;
  if (type.includes('commercial')) scores.casual += 2;
  else if (type.includes('coworking')) scores.casual += 1;

  // Normalize scores
  Object.keys(scores).forEach(key => {
    scores[key] = Math.min(10, scores[key]);
  });

  return scores;
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
      throw new Error(data.meta?.error || 'Failed to fetch places');
    }

    return res.json(data);
  } catch (error) {
    console.error('Places API error:', error);
    return res.status(500).json({
      meta: {
        code: 500,
        error_type: 'server_error',
        error_detail: error.message
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
      throw new Error(data.meta?.error || 'Failed to fetch place details');
    }

    return res.json(data);
  } catch (error) {
    console.error('Place details API error:', error);
    return res.status(500).json({
      meta: {
        code: 500,
        error_type: 'server_error',
        error_detail: error.message
      }
    });
  }
});

api.post('/analyze-workspaces', async (req, res) => {
  try {
    const { places } = req.body;
    if (!places?.length || !places[0]) {
      return res.status(400).json({
        meta: { code: 400, error_type: 'invalid_request' }
      });
    }

    const place = places[0];
    const scores = calculateWorkStyleScores(place);
    let userInsight = null;

    if (place.description) {
      const parsed = await parseUserDescription(place.description);
      userInsight = parsed?.userInsight || null;
    }

    return res.json({
      meta: { code: 200 },
      insights: {
        places: [{
          id: place.id || place.ID,
          scores,
          userInsight
        }]
      }
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({
      meta: { code: 500, error_type: 'analysis_failed' }
    });
  }
});

// Health check endpoint
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
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      meta: {
        code: 400,
        error_type: 'invalid_json',
        error_detail: 'Invalid JSON in request body'
      }
    });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      meta: {
        code: 413,
        error_type: 'payload_too_large',
        error_detail: 'Request payload is too large'
      }
    });
  }

  if (err.name === 'OpenAIError') {
    return res.status(500).json({
      meta: {
        code: 500,
        error_type: 'openai_error',
        error_detail: 'Error generating insights. Please try again later.'
      }
    });
  }

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