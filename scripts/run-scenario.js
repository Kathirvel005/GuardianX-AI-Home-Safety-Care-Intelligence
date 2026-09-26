#!/usr/bin/env node

/**
 * GuardianX CLI Demo Scenario Runner
 * Usage: node scripts/run-scenario.js [scenarioId] [delayMs]
 * Example: node scripts/run-scenario.js possibleSafetyIncident 1000
 */

const http = require('http');

const scenarioId = process.argv[2] || 'possibleSafetyIncident';
const delayMs = parseInt(process.argv[3] || '1200', 10);
const port = process.env.PORT || 5000;

console.log(`[GuardianX CLI] Dispatching scenario: '${scenarioId}' (delay: ${delayMs}ms)...`);

const postData = JSON.stringify({ scenarioId, delayMs });

const req = http.request(
  {
    hostname: 'localhost',
    port,
    path: '/api/demo/scenario',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  },
  (res) => {
    let body = '';
    res.on('data', (chunk) => (body += chunk));
    res.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        if (parsed.success) {
          console.log(`✅ Scenario '${scenarioId}' started successfully.`);
          console.log(`📡 Monitor progress in real time at http://localhost:5173/dashboard`);
        } else {
          console.error(`❌ Failed to start scenario:`, parsed.error);
        }
      } catch (e) {
        console.error(`❌ Response parsing failed:`, body);
      }
    });
  }
);

req.on('error', (err) => {
  console.error(`❌ Connection error: Is the GuardianX backend running on port ${port}?`);
  console.error(err.message);
  process.exit(1);
});

req.write(postData);
req.end();
