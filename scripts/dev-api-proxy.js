#!/usr/bin/env node
/**
 * Local HTTP proxy: http://127.0.0.1:8765 → https://dev.prosto-app.ru
 * Use when iOS Simulator returns "Network request failed" to external HTTPS
 * but Safari in the simulator opens the site (RN/CFNetwork quirk on some Mac setups).
 *
 * 1. npm run dev:api-proxy
 * 2. In .env: API_BASE_URL=http://127.0.0.1:8765
 * 3. Reload Metro (npm start) and rebuild app if needed
 */
const http = require('http');
const https = require('https');

const LISTEN_HOST = '127.0.0.1';
const LISTEN_PORT = Number(process.env.DEV_API_PROXY_PORT || 8765);
const TARGET_HOST = (process.env.PROXY_TARGET || 'dev.prosto-app.ru').replace(/^https?:\/\//, '');

const server = http.createServer((clientReq, clientRes) => {
  const chunks = [];

  clientReq.on('data', (chunk) => chunks.push(chunk));
  clientReq.on('end', () => {
    const body = Buffer.concat(chunks);
    const headers = { ...clientReq.headers, host: TARGET_HOST };

    delete headers['proxy-connection'];

    const upstream = https.request(
      {
        hostname: TARGET_HOST,
        port: 443,
        path: clientReq.url,
        method: clientReq.method,
        headers,
      },
      (upRes) => {
        clientRes.writeHead(upRes.statusCode || 502, upRes.headers);
        upRes.pipe(clientRes);
      },
    );

    upstream.on('error', (error) => {
      clientRes.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
      clientRes.end(error instanceof Error ? error.message : 'Proxy error');
    });

    if (body.length > 0) {
      upstream.write(body);
    }

    upstream.end();
  });
});

server.listen(LISTEN_PORT, LISTEN_HOST, () => {
  console.log(`Dev API proxy listening on http://${LISTEN_HOST}:${LISTEN_PORT} → https://${TARGET_HOST}`);
});
