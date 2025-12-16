/**
 * Simple Deploy Webhook Server
 * Listens on port 8020 and triggers deploy.sh
 * 
 * Usage:
 *   node scripts/deploy-webhook.js
 *   OR
 *   pm2 start scripts/deploy-webhook.js --name "doc2md-deploy"
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const PORT = 8020;
const SECRET = process.env.DEPLOY_SECRET || 'changeme_in_prod'; // Simple protection

const server = http.createServer((req, res) => {
  // CORS for convenience (optional)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET');

  if (req.method === 'GET' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ready', timestamp: new Date(), name: 'doc2md-deploy' }));
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405);
    res.end('Method Not Allowed');
    return;
  }

  // Basic Auth Check (Query param ?secret=... or Header X-Deploy-Secret)
  const url = new URL(req.url, `http://${req.headers.host}`);
  const querySecret = url.searchParams.get('secret');
  const headerSecret = req.headers['x-deploy-secret'];

  if ((querySecret !== SECRET) && (headerSecret !== SECRET)) {
    console.log(`[${new Date().toISOString()}] ⛔ Auth failed from ${req.socket.remoteAddress}`);
    res.writeHead(403);
    res.end('Forbidden: Invalid Secret');
    return;
  }

  console.log(`[${new Date().toISOString()}] 🚀 Deploy triggered from ${req.socket.remoteAddress}`);
  
  // Trigger Deployment
  const deployScript = path.join(__dirname, 'deploy.sh');
  // Use spawn to run shell script
  const child = spawn('bash', [deployScript], {
    cwd: path.join(__dirname, '..'), // Run from root
    stdio: 'inherit' // Pipe output to this process's stdout (logs visible in PM2)
  });

  child.on('close', (code) => {
    console.log(`[${new Date().toISOString()}] ✅ Deploy finished with code ${code}`);
  });

  // Respond immediately (Async processing)
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    status: 'deploying', 
    message: 'Deployment triggered successfully. Check logs for progress.' 
  }));
});

server.listen(PORT, () => {
  console.log(`Deploy Hook listening on port ${PORT}`);
  console.log(`Test with: curl -X POST http://localhost:${PORT}?secret=${SECRET}`);
});
