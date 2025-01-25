// config.js
const isDevelopment = process.env.NODE_ENV === 'development';

const API_CONFIG = {
  // In development, use the full URL with port 8888
  baseUrl: isDevelopment 
    ? 'http://localhost:8888/.netlify/functions/api'
    : '/.netlify/functions/api',
  appId: process.env.REACT_APP_WORKFROM_API_KEY
};

export default API_CONFIG;