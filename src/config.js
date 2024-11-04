// src/config.js
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API_CONFIG = {
  // Update baseUrl to include .netlify/functions for both dev and prod
  baseUrl: isDevelopment 
    ? 'http://localhost:8888/.netlify/functions/api' 
    : '/.netlify/functions/api',
  appId: 'RxhYNXu8CyPavHhO'
};

export default API_CONFIG;