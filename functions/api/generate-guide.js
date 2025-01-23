const fetchWithTimeout = async (url, options = {}, timeout = 25000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

exports.handler = async (event, context) => {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*', // In production, replace with your actual domain
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Use fetchWithTimeout instead of regular fetch
    const response = await fetchWithTimeout('your-api-endpoint', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    // ... rest of your code ...
    
    return {
      statusCode: 200,
      headers,  // Include headers in the response
      body: JSON.stringify(result)
    };
  } catch (error) {
    return {
      statusCode: error.name === 'AbortError' ? 504 : 500,
      headers,
      body: JSON.stringify({ 
        error: error.name === 'AbortError' ? 
          'Request timeout - please try again' : 
          error.message 
      })
    };
  }
}; 