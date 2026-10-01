const fs = require('fs');
const path = require('path');
const net = require('net');
const app = require('./src/app');
const { PORT } = require('./src/config/env');

// Process-wide unhandled rejection / exception guards
process.on('uncaughtException', (err) => {
  console.error('[synDx Server Error] Uncaught Exception:', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('[synDx Server Error] Unhandled Rejection:', reason);
});

function checkPortAvailable(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => tester.close(() => resolve(true)))
      .listen(port, host);
  });
}

async function findAvailablePort(preferredPort) {
  const candidatePorts = [preferredPort, 3050, 3051, 3052, 3055, 8080, 8088];
  for (const p of candidatePorts) {
    if (await checkPortAvailable(p)) return p;
  }
  return 0; // Let OS assign a free port if all specified are occupied
}

async function startServer() {
  let targetPort = PORT;
  if (!process.env.PORT) {
    const isPreferredFree = await checkPortAvailable(targetPort);
    if (!isPreferredFree) {
      console.warn(`[!] Port ${targetPort} is occupied by another process. Scanning for free port...`);
      targetPort = await findAvailablePort(targetPort);
    }
  }

  const server = app.listen(targetPort, () => {
    const actualPort = server.address().port;
    try {
      fs.writeFileSync(path.join(__dirname, '.active_port'), String(actualPort), 'utf8');
    } catch (e) {}

    console.log(`======================================================================`);
    console.log(`[+] synDx Production Web Server & API is ONLINE!`);
    console.log(`  -> Web Console / UI  : http://localhost:${actualPort}`);
    console.log(`  -> Review Console    : http://localhost:${actualPort}/syndx-review-console-full.html`);
    console.log(`  -> Health Endpoint   : http://localhost:${actualPort}/api/health`);
    console.log(`======================================================================`);
  });

  server.on('error', (err) => {
    console.error(`[FATAL] Failed to bind to port ${targetPort}:`, err.message);
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
