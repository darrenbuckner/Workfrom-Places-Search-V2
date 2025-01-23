const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const { OpenAI } = require('openai');
const app = express();
const api = express();
require('dotenv').config();

// Enhanced cache implementation
class SimpleCache {
  constructor(maxSize = 100, cleanupInterval = 3600000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    
    // Periodic cleanup of expired items
    setInterval(() => this.cleanup(), cleanupInterval);
  }

  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  set(key, value, ttl) {
    try {
      if (this.cache.size >= this.maxSize) {
        const oldestKey = this.cache.keys().next().value;
        this.cache.delete(oldestKey);
      }
      
      this.cache.set(key, {
        value,
        expiry: Date.now() + (ttl * 1000)
      });
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  get(key) {
    try {
      const item = this.cache.get(key);
      if (!item) return null;
      
      if (Date.now() > item.expiry) {
        this.cache.delete(key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  clear() {
    this.cache.clear();
  }
}

// Improved rate limiter
class SimpleRateLimiter {
  constructor(windowMs = 900000, max = 100) {
    this.windowMs = windowMs;
    this.max = max;
    this.requests = new Map();
    
    setInterval(() => this.cleanup(), windowMs);
  }

  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    for (const [key, timestamp] of this.requests.entries()) {
      if (timestamp < windowStart) {
        this.requests.delete(key);
      }
    }
  }

  try(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    const requestCount = [...this.requests.values()]
      .filter(timestamp => timestamp > windowStart)
      .length;

    if (requestCount >= this.max) {
      return false;
    }

    this.requests.set(`${key}_${now}`, now);
    return true;
  }
}

// Configuration
const { OPENAI_API_KEY } = process.env;
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;
const cache = new SimpleCache(100);
const rateLimiter = new SimpleRateLimiter();

// Constants
const CACHE_DURATIONS = {
  GUIDE: 24 * 60 * 60,
  PLACE: 6 * 60 * 60
};

const OPENAI_TIMEOUT = 45000; // 30 seconds

// Update CORS configuration to be more permissive
const corsOptions = {
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Requested-With',
    'Accept-Language',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  credentials: true,
  maxAge: 86400
};

// Apply CORS middleware
app.use(cors(corsOptions));
api.use(cors(corsOptions));

// Common middleware
app.use(express.json({ limit: '1mb' }));
api.use(express.json({ limit: '1mb' }));

// Enhanced error handling
class APIError extends Error {
  constructor(code, type, detail, retryable = false) {
    super(detail);
    this.name = 'APIError';
    this.code = code;
    this.type = type;
    this.detail = detail;
    this.retryable = retryable;
  }

  toResponse() {
    return {
      meta: {
        code: this.code,
        error_type: this.type,
        error_detail: this.detail,
        retryable: this.retryable
      }
    };
  }
}

// Helper functions
const stripHtml = (html) => {
  if (!html) return '';
  try {
    return html.replace(/<[^>]*>?/gm, '').trim();
  } catch (error) {
    console.error('Error stripping HTML:', error);
    return '';
  }
};

const isValidDescription = (description) => {
  if (!description) return false;
  const cleaned = stripHtml(description);
  return cleaned.length >= 50 && !cleaned.match(/^(generic|placeholder|test)\s+description$/i);
};

const generateCacheKey = (type, ...params) => {
  try {
    const key = params.map(param => {
      if (param === null || param === undefined) return '';
      return typeof param === 'object' ? 
        JSON.stringify(param) : String(param);
    }).join(':');
    return `${type}:${key}`;
  } catch (error) {
    console.error('Cache key generation error:', error);
    return `${type}:error`;
  }
};

const withTimeout = async (promise, timeout) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};

const withCache = async (key, duration, generator) => {
  try {
    const cached = cache.get(key);
    if (cached) {
      return cached;
    }

    const fresh = await generator();
    cache.set(key, fresh, duration);
    return fresh;
  } catch (error) {
    console.warn('Cache operation failed:', error);
    return generator();
  }
};

// Workspace analysis functions
const calculateWorkStyleScores = (place) => {
  const scores = {
    focus: 0,
    group: 0,
    calls: 0,
    casual: 0
  };

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

const parseUserDescription = async (description) => {
  if (!description || !openai) return null;
  try {
    if (!isValidDescription(description)) return null;

    const prompt = `
      Below is a user-submitted description of a workspace. Create a single, 
      concise sentence (max 20 words) that highlights the most unique or 
      helpful insight for remote workers and freelancers.

      Focus only on specific, distinctive features rather than generic observations.
      If the description doesn't contain any unique or helpful insights, respond with an insight about amenities mentioned. If there are no amenities mentioned, respond with null.

      User Description: "${stripHtml(description).trim()}"

      Respond ONLY with a JSON object in this exact format:
      {
        "userInsight": "<single insightful sentence or null>"
      }
    `;

    const completion = await withTimeout(
      openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You create concise, specific insights from workspace descriptions. Focus only on unique, helpful details that would matter to remote workers and freelancers. Always respond in valid JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 150
      }),
      OPENAI_TIMEOUT
    );

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

const validateGuideResponse = (text) => {
  try {
    const parsed = JSON.parse(text);
    if (!parsed.title || !parsed.overview || !Array.isArray(parsed.recommendations)) {
      console.error('Invalid guide structure:', parsed);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Guide parsing error:', error, '\nResponse:', text);
    return false;
  }
};

const createGuidePrompt = (places, location) => {
  const simplifiedPlaces = places.map(place => ({
    id: place.id || place.ID,
    name: place.title,
    type: place.type || 'Unknown',
    features: {
      wifi: place.download ? `${Math.round(place.download)}Mbps` : 'Unknown',
      noise: (place.noise_level || place.noise || 'Unknown').toLowerCase(),
      power: place.power && place.power !== 'none',
      coffee: place.coffee === "1",
      food: place.food === "1",
      outdoor: place.outdoor_seating === "1" || place.outside === "1"
    },
    score: place.workabilityScore,
    distance: parseFloat(place.distance),
    description: isValidDescription(place.description) ? 
      stripHtml(place.description).substring(0, 200) : null
  }));

  return {
    system: `You are a workspace curator creating concise, practical guides. 
    You MUST respond with valid JSON only in this exact format:
    {
      "title": "Area name: Key characteristic",
      "overview": "2-3 sentence area overview",
      "recommendations": [
        {
          "id": "place_id",
          "name": "Place Name", 
          "description": "Why good for remote work",
          "tips": ["Tip 1", "Tip 2"],
          "peakHours": "When busy/quiet",
          "transit": "How to get there"
        }
      ]
    }
    Do not include any additional text or explanation.`,
    
    user: `Create a curated guide for remote workers at location: ${location.latitude}, ${location.longitude}

    Workspace details:
    ${JSON.stringify(simplifiedPlaces, null, 2)}

    Focus insights on:
    1. WiFi reliability and speeds
    2. Power availability  
    3. Noise levels and focus spaces
    4. Peak hours to avoid crowds
    5. Most unique workspace features`
  };
};

// Middleware
const rateLimitMiddleware = (req, res, next) => {
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  if (!rateLimiter.try(clientIp)) {
    return res.status(429).json(new APIError(
      429,
      'rate_limit_exceeded',
      'Too many requests, please try again later',
      true
    ).toResponse());
  }
  
  next();
};

const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err);

  // Handle OpenAI specific errors
  if (err.status === 400 && err.error?.type === 'invalid_request_error') {
    return res.status(500).json(new APIError(
      500,
      'openai_error',
      'Guide generation service error',
      true
    ).toResponse());
  }

  if (err instanceof APIError) {
    return res.status(err.code).json(err.toResponse());
  }

  if (err.message === 'CORS not allowed') {
    return res.status(403).json(new APIError(
      403,
      'cors_error',
      'Origin not allowed',
      false
    ).toResponse());
  }

  if (err.message === 'Request timeout') {
    return res.status(408).json(new APIError(
      408,
      'timeout_error',
      'Request timed out',
      true
    ).toResponse());
  }

  res.status(500).json(new APIError(
    500,
    'server_error',
    'An unexpected error occurred',
    true
  ).toResponse());
};

// API Endpoints
api.post('/analyze-workspaces', async (req, res, next) => {
  try {
    const { places } = req.body;
    if (!places?.length || !places[0]) {
      throw new APIError(400, 'invalid_request', 'Invalid or missing places data');
    }

    const place = places[0];
    const scores = calculateWorkStyleScores(place);
    let userInsight = null;

    if (place.description) {
      const parsed = await parseUserDescription(place.description);
      userInsight = parsed?.userInsight || null;
    }

    res.json({
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
    next(error);
  }
});

api.post('/generate-guide', async (req, res, next) => {
  try {
    const { places, location } = req.body; // Remove appid requirement

    if (!places?.length || !location?.latitude || !location?.longitude) {
      throw new APIError(400, 'invalid_input', 'Missing required data');
    }

    if (!openai) {
      throw new APIError(500, 'configuration_error', 'Guide service unavailable');
    }

    const cacheKey = generateCacheKey(
      'guide',
      location.latitude.toFixed(3),
      location.longitude.toFixed(3),
      places.map(p => p.ID).sort().join(',')
    );

    const guide = await withCache(cacheKey, CACHE_DURATIONS.GUIDE, async () => {
      const prompt = createGuidePrompt(places, location);

      // 5. Add retries for OpenAI calls
      let attempts = 0;
      const maxAttempts = 2;
      
      while (attempts < maxAttempts) {
        try {
          const completion = await withTimeout(
            openai.chat.completions.create({
              model: "gpt-4",
              messages: [
                { role: "system", content: prompt.system },
                { role: "user", content: prompt.user }
              ],
              temperature: 0.3, // Lower temperature for more consistent formatting
              max_tokens: 1000,
              presence_penalty: 0,
              frequency_penalty: 0
            }),
            OPENAI_TIMEOUT
          );

          const responseText = completion.choices[0].message.content;
          
          // 6. Validate response before returning
          if (!validateGuideResponse(responseText)) {
            throw new Error('Invalid guide format received');
          }

          const rawGuide = JSON.parse(responseText);
          return {
            ...rawGuide,
            recommendations: rawGuide.recommendations.map(rec => {
              const originalPlace = places.find(p => 
                p.ID === rec.id || p.title === rec.name
              );
              
              if (originalPlace) {
                return {
                  ...rec,
                  images: {
                    thumbnail: originalPlace.thumbnail_img || null,
                    full: originalPlace.full_img || null
                  },
                  location: {
                    latitude: originalPlace.latitude,
                    longitude: originalPlace.longitude,
                    street: originalPlace.street,
                    city: originalPlace.city
                  },
                  workabilityScore: originalPlace.workabilityScore,
                  distance: originalPlace.distance
                };
              }
              return rec;
            })
          };
        } catch (error) {
          attempts++;
          if (attempts === maxAttempts) {
            throw error;
          }
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    });

    res.json({
      meta: { code: 200 },
      guide
    });

  } catch (error) {
    next(error);
  }
});

api.get('/places/ll/:coords', async (req, res, next) => {
  try {
    const { coords } = req.params;
    const { radius = 2, rpp = 100, appid } = req.query;  // Keep appid for Workfrom API

    if (!appid) {
      throw new APIError(
        400, 
        'missing_parameter',
        'Missing required appid parameter'
      );
    }

    const WORKFROM_API_URL = `https://workfrom.co/api/places/ll/${coords}`;
    
    const response = await withTimeout(
      fetch(
        `${WORKFROM_API_URL}?radius=${radius}&appid=${appid}&rpp=${rpp}`,  // Keep appid in URL
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      ),
      OPENAI_TIMEOUT
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new APIError(
        response.status,
        'api_error',
        data.meta?.error || 'Failed to fetch places',
        response.status >= 500
      );
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

api.get('/places/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { appid } = req.query;  // Keep appid for Workfrom API

    if (!appid) {
      throw new APIError(
        400,
        'missing_parameter',
        'Missing required appid parameter'
      );
    }

    const WORKFROM_API_URL = `https://workfrom.co/api/places/${id}`;
    
    const response = await withTimeout(
      fetch(
        `${WORKFROM_API_URL}?appid=${appid}`,  // Keep appid in URL
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      ),
      OPENAI_TIMEOUT
    );

    const data = await response.json();

    if (!response.ok) {
      throw new APIError(
        response.status,
        'api_error',
        data.meta?.error || 'Failed to fetch place details',
        response.status >= 500
      );
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

api.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      openai: !!openai,
      cache: true
    }
  };

  res.json({
    meta: { 
      code: 200,
      version: '1.0.0'
    },
    health
  });
});

// Apply middleware
api.use(rateLimitMiddleware);

// Mount API routes
app.use('/.netlify/functions/api', api);

// Error handling middleware should be last
app.use(errorHandler);
api.use(errorHandler);

// Export handler
module.exports.handler = serverless(app);