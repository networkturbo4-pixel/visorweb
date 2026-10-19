/**
 * WebReview Pro - cPanel / CloudLinux Passenger Entry Point
 * 
 * Este archivo actúa como punto de arranque principal requerido
 * por el instalador "Setup Node.js App" de cPanel (Phusion Passenger).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.join(__dirname, 'startup_error.txt');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try {
    fs.appendFileSync(logFile, line);
  } catch (e) {}
  console.log(msg);
}

process.on('uncaughtException', (err) => {
  log(`UNCAUGHT EXCEPTION: ${err?.stack || err}`);
});

process.on('unhandledRejection', (reason) => {
  log(`UNHANDLED REJECTION: ${reason?.stack || reason}`);
});

log('Iniciando WebReview Pro...');
log(`Node.js Version: ${process.version}`);
log(`PID: ${process.pid}`);
log(`Port / Socket: ${process.env.PORT || 'default 3000'}`);

import('./server.js')
  .then(() => log('Servidor Express server.js montado correctamente.'))
  .catch((err) => {
    log(`ERROR FATAL DURANTE INICIALIZACIÓN: ${err?.stack || err}`);
  });

