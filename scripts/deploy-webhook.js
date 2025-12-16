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

const fs = require('fs');

const PORT = 8020;

// Try to load secret from process.env, then fallback to reading apps/backend/.env
let SECRET = process.env.DEPLOY_SECRET;

if (!SECRET) {
  try {
    const envPath = path.join(__dirname, '..', 'apps', 'backend', '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/^DEPLOY_TOKEN=(.*)$/m);
      if (match) {
        SECRET = match[1].trim();
        console.log(`Loaded DEPLOY_TOKEN from ${envPath}`);
      }
    }
  } catch (error) {
    console.error('Failed to load .env file:', error);
  }
}

SECRET = SECRET || 'changeme_in_prod'; // Final fallback

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
  
  // Check for fast mode
  const isFast = url.searchParams.get('fast') === 'true' || url.searchParams.get('f') === 'true';
  const args = [path.join(__dirname, 'deploy.sh')];
  
  if (isFast) {
    args.push('-f');
    console.log('⚡ Triggering Fast Mode deployment');
  }

  // Use spawn to run shell script
  const child = spawn('bash', args, {
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
    mode: isFast ? 'fast' : 'standard',
    message: 'Deployment triggered successfully. check logs for progress.' 
  }));
});

server.listen(PORT, () => {
  console.log(`Deploy Hook listening on port ${PORT}`);
  console.log(`Test with: curl -X POST http://localhost:${PORT}?secret=${SECRET}&fast=true`);
});
