// src/config.js
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API_CONFIG = {
  baseUrl: isDevelopment ? 'http://localhost:8888/api' : '/api',
  appId: 'RxhYNXu8CyPavHhO'
};

export default API_CONFIG;