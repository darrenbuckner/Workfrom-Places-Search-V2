// config.js
const isDevelopment = process.env.NODE_ENV === 'development';

const API_CONFIG = {
  // In production, use relative path to ensure it works with any domain
  baseUrl: isDevelopment 
    ? 'http://localhost:8888/.netlify/functions/api'
    : '/.netlify/functions/api',
  appId: 'RxhYNXu8CyPavHhO'
};

export default API_CONFIG;