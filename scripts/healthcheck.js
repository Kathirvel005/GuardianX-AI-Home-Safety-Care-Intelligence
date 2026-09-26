#!/usr/bin/env node

/**
 * GuardianX Pre-flight Health & Connectivity Checker
 */

const http = require('http');

const port = process.env.PORT || 5000;

console.log(`[GuardianX Healthcheck] Probing backend on port ${port}...`);

http.get(`http://localhost:${port}/api/health`, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log(`✅ Backend Status: ${parsed.status}`);
      console.log(`🚀 Service: ${parsed.service} (v${parsed.version})`);
      console.log(`⏱️ Uptime: ${Math.round(parsed.uptime)}s`);
    } catch (e) {
      console.error('❌ Failed to parse healthcheck response:', data);
    }
  });
}).on('error', (err) => {
  console.error(`❌ Health check failed: ${err.message}`);
  process.exit(1);
});
