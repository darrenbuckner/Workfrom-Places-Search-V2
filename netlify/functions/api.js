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

// Add these helper functions after the SimpleRateLimiter class

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

const validateGuideResponse = (response) => {
  try {
    const parsed = JSON.parse(response);
    const validStructure = 
      parsed.title &&
      parsed.introduction &&
      Array.isArray(parsed.recommendations) &&
      parsed.recommendations.length > 0 &&
      Array.isArray(parsed.tips) &&
      parsed.tips.length > 0;

    if (!validStructure) {
      console.error('Invalid guide structure:', parsed);
      return false;
    }

    // Validate each recommendation
    const validRecommendations = parsed.recommendations.every(rec => 
      rec.id && rec.name && rec.highlight && rec.description && 
      Array.isArray(rec.bestFor) && rec.bestFor.length > 0
    );

    if (!validRecommendations) {
      console.error('Invalid recommendations structure:', parsed.recommendations);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Guide validation error:', error);
    return false;
  }
};

const createGuidePrompt = (places, location) => {
  return {
    system: "Create concise workspace guides in JSON format. Keep descriptions under 50 words.",
    user: `Create a guide for remote workers near (${location.latitude}, ${location.longitude}).

Places:
${places.slice(0, 5).map(place => `${place.name || place.title}
WiFi: ${place.download ? `${place.download} Mbps` : 'Available'}
Noise: ${place.noise_level || place.noise || 'Moderate'}`).join('\n\n')}

Return JSON:
{
  "title": "short title",
  "introduction": "1-2 sentences",
  "recommendations": [
    {
      "id": "place_id",
      "name": "Place Name",
      "highlight": "one-line highlight",
      "description": "1-2 sentences",
      "bestFor": ["focus", "meetings", "casual"]
    }
  ],
  "tips": ["2-3 tips"]
}`
  };
};

// Configuration
const { OPENAI_API_KEY } = process.env;
console.log('OpenAI Setup:', {
  hasKey: !!OPENAI_API_KEY,
  keyLength: OPENAI_API_KEY?.length
});

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;
const cache = new SimpleCache(100);
const rateLimiter = new SimpleRateLimiter();

// Constants
const CACHE_DURATIONS = {
  GUIDE: 24 * 60 * 60,
  PLACE: 6 * 60 * 60
};

const OPENAI_TIMEOUT = 45000; // 30 seconds

// 1. Move helper functions to the top (before any route definitions)
const generateCacheKey = (type, ...params) => {
  try {
    // Round coordinates to 3 decimal places to increase cache hits
    const processedParams = params.map(param => {
      if (typeof param === 'number') {
        return Math.round(param * 1000) / 1000;
      }
      if (param === null || param === undefined) return '';
      return typeof param === 'object' ? 
        JSON.stringify(param) : String(param);
    });
    
    return `${type}:${processedParams.join(':')}`;
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

// Update CORS configuration to be more permissive
const corsOptions = {
  origin: ['http://localhost:3001', 'http://localhost:8888'],  // Specify allowed origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept-Language'],
  credentials: true,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS before any other middleware
app.use(cors(corsOptions));
api.use(cors(corsOptions));

// Add OPTIONS handling for preflight requests
api.options('*', cors(corsOptions));

// Then your other middleware
app.use(express.json({ limit: '1mb' }));
api.use(express.json({ limit: '1mb' }));

// Places endpoint must be registered BEFORE rate limiter
api.get('/places/ll/:coords', async (req, res, next) => {
  try {
    const { coords } = req.params;
    const { radius = 2000, rpp = 100, appid } = req.query; // Default to 2000 meters

    // Convert meters to miles for the API, ensure it's a number
    const radiusInMiles = Number(radius) / 1609.34;
    
    // Validate radius
    if (isNaN(radiusInMiles) || radiusInMiles <= 0) {
      return res.status(400).json({
        meta: {
          code: 400,
          error_type: 'invalid_parameter',
          error_detail: 'Invalid radius parameter'
        }
      });
    }

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
    console.log('Fetching from:', WORKFROM_API_URL, { 
      radiusMeters: Number(radius),
      radiusMiles: radiusInMiles.toFixed(2),
      rpp, 
      appid 
    });
    
    const response = await fetch(
      `${WORKFROM_API_URL}?radius=${radiusInMiles.toFixed(2)}&appid=${appid}&rpp=${rpp}`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();
    console.log('API Response:', {
      status: response.status,
      meta: data.meta,
      hasResponse: !!data.response,
      responseCount: data.response?.length,
      radius: radiusInMiles
    });
    
    // Check if the response itself indicates an error
    if (!response.ok) {
      return res.status(response.status).json({
        meta: {
          code: response.status,
          error_type: 'api_error',
          error_detail: data.meta?.error || 'Failed to fetch places'
        }
      });
    }

    // Check for valid response structure
    if (!data.meta || !data.response) {
      console.error('Invalid API response structure:', data);
      return res.status(500).json({
        meta: {
          code: 500,
          error_type: 'invalid_response',
          error_detail: 'Invalid response from places API'
        }
      });
    }

    // Check for no results
    if (data.response.length === 0) {
      return res.status(404).json({
        meta: {
          code: 404,
          error_type: 'empty_dataset',
          error_detail: `No workspaces found within ${(radius/1609.34).toFixed(1)} miles. Try increasing your search radius or searching in a different area.`
        }
      });
    }

    // Success response - transform the response to match expected structure
    res.json({
      meta: { 
        code: 200,
        results: {
          ...data.meta.results,
          radius: `${radiusInMiles.toFixed(2)} miles`
        }
      },
      response: data.response.map(place => ({
        ...place,
        // Ensure consistent property names
        id: place.ID || place.id,
        name: place.title || place.name,
        title: place.title || place.name,
        images: {
          thumbnail: place.thumbnail_img || null,
          full: place.full_img || null
        }
      }))
    });

  } catch (error) {
    console.error('Places API error:', error);
    next(error);
  }
});

// Then register all routes BEFORE the rate limiter
api.get('/test', (req, res) => {
  res.json({
    meta: { code: 200 },
    message: 'API is working'
  });
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

api.post('/generate-guide', async (req, res, next) => {
  try {
    const { places, location } = req.body;
    
    console.log('Received request:', {
      placesCount: places?.length,
      location,
      hasOpenAI: !!openai
    });

    if (!places?.length || !location?.latitude || !location?.longitude) {
      console.error('Invalid input:', { places, location });
      throw new APIError(400, 'invalid_input', 'Missing required data');
    }

    if (!openai) {
      console.error('OpenAI not configured:', { 
        hasKey: !!process.env.OPENAI_API_KEY,
        env: process.env.NODE_ENV 
      });
      throw new APIError(500, 'configuration_error', 'Guide service unavailable');
    }

    // Convert string coordinates to numbers before using toFixed
    const cacheKey = generateCacheKey(
      'guide',
      parseFloat(location.latitude).toFixed(3),
      parseFloat(location.longitude).toFixed(3),
      places.map(p => p.ID).sort().join(',')
    );

    console.log('Cache key:', cacheKey);

    const guide = await withCache(cacheKey, CACHE_DURATIONS.GUIDE, async () => {
      try {
        const prompt = createGuidePrompt(places, location);
        console.log('Generated prompt:', prompt);

        let attempts = 0;
        const maxAttempts = 2;
        
        while (attempts < maxAttempts) {
          try {
            console.log(`Attempt ${attempts + 1} of ${maxAttempts}`);
            
            const completion = await withTimeout(
              openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                  { role: "system", content: prompt.system },
                  { role: "user", content: prompt.user }
                ],
                temperature: 0.3,
                max_tokens: 500,
                presence_penalty: 0,
                frequency_penalty: 0,
                top_p: 0.8
              }),
              20000
            );

            const responseText = completion.choices[0].message.content;
            console.log('OpenAI response:', responseText);
            
            if (!validateGuideResponse(responseText)) {
              console.error('Invalid guide format:', responseText);
              throw new Error('Invalid guide format received');
            }

            const rawGuide = JSON.parse(responseText);
            return {
              ...rawGuide,
              recommendations: rawGuide.recommendations.map(rec => {
                const originalPlace = places.find(p => 
                  String(p.ID) === String(rec.id) || 
                  p.title?.toLowerCase() === rec.name?.toLowerCase()
                );
                
                if (originalPlace) {
                  // Get actual images if they exist
                  const images = originalPlace.thumbnail_img || originalPlace.image || originalPlace.featured_img || 
                                (originalPlace.images && originalPlace.images[0]) 
                                ? {
                                    thumbnail: originalPlace.thumbnail_img || 
                                              originalPlace.image || 
                                              originalPlace.featured_img ||
                                              (originalPlace.images && originalPlace.images[0]),
                                    full: originalPlace.full_img || 
                                          originalPlace.image || 
                                          originalPlace.featured_img ||
                                          (originalPlace.images && originalPlace.images[0])
                                  }
                                : null;  // No images available

                  return {
                    ...rec,
                    id: originalPlace.ID,
                    images,  // This will be null if no images are available
                    location: {
                      latitude: parseFloat(originalPlace.latitude || location.latitude),
                      longitude: parseFloat(originalPlace.longitude || location.longitude),
                      street: originalPlace.street || '',
                      city: originalPlace.city || ''
                    },
                    coordinates: {
                      latitude: parseFloat(originalPlace.latitude || location.latitude),
                      longitude: parseFloat(originalPlace.longitude || location.longitude)
                    },
                    workabilityScore: originalPlace.workabilityScore,
                    distance: originalPlace.distance || '0',
                    download: originalPlace.download || '0'
                  };
                }
                return {
                  ...rec,
                  images: null,  // No default images
                  coordinates: {
                    latitude: parseFloat(location.latitude),
                    longitude: parseFloat(location.longitude)
                  },
                  distance: '0',
                  download: '0'
                };
              })
            };
          } catch (error) {
            console.error(`Attempt ${attempts + 1} failed:`, error);
            attempts++;
            if (attempts === maxAttempts) {
              throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      } catch (error) {
        console.error('Guide generation failed:', error);
        throw error;
      }
    });

    // Set headers first
    res.set({
      'Cache-Control': 'public, max-age=3600',
      'Surrogate-Control': 'max-age=86400'
    });

    // Then send the response
    res.json({
      meta: { code: 200 },
      guide
    });

  } catch (error) {
    console.error('Endpoint error:', error);
    next(error);
  }
});

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

// Add the missing places/:id endpoint
api.get('/places/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { appid } = req.query;

    if (!appid) {
      throw new APIError(
        400,
        'missing_parameter',
        'Missing required appid parameter'
      );
    }

    const WORKFROM_API_URL = `https://workfrom.co/api/places/${id}`;
    
    const fetchWithTimeout = async (url, options, timeout = 20000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };

    const response = await fetchWithTimeout(
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

// Add this after the SimpleRateLimiter class and before the routes

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

// Also add the error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err);

  if (err instanceof APIError) {
    return res.status(err.code).json(err.toResponse());
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

// Rate limiter should be after routes
api.use(rateLimitMiddleware);

// Mount API routes
app.use('/.netlify/functions/api', api);

// Error handling must be last
app.use(errorHandler);
api.use(errorHandler);

// Add after other helper functions
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
    const prompt = `
      Below is a user-submitted description of a workspace. Create a single, 
      concise sentence (max 20 words) that highlights the most unique or 
      helpful insight for remote workers and freelancers.

      Description: "${description.trim()}"

      Respond ONLY with a JSON object in this format:
      {
        "userInsight": "<single insightful sentence or null>"
      }
    `;

    const completion = await withTimeout(
      openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 100
      }),
      OPENAI_TIMEOUT
    );

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Failed to parse description:', error);
    return null;
  }
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Accept-Language, X-Requested-With',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

// Export handler
module.exports.handler = serverless(app);