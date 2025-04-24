const { createProxyMiddleware } = require('http-proxy-middleware');

// This code sets up a proxy middleware for a React application
module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5001',
      changeOrigin: true,
    })
  );
};