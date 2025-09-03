#!/usr/bin/env node

// Load environment variables and start Electron with them
const { spawn } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');

// Load from root .env file
const rootEnvPath = path.resolve(__dirname, '../../../.env');
const result = dotenv.config({ path: rootEnvPath });

if (result.error) {
  console.warn('[Electron] Warning: Could not load .env file:', result.error.message);
  console.warn('[Electron] Using default ports: UI=5177, API=3001');
}

// Log loaded configuration for debugging
console.log('[Electron] Starting with environment:');
console.log(`  UI_HOST: ${process.env.UI_HOST || 'localhost'}`);
console.log(`  UI_PORT: ${process.env.UI_PORT || '5177'}`);
console.log(`  API_HOST: ${process.env.API_HOST || 'localhost'}`);
console.log(`  API_PORT: ${process.env.API_PORT || '3001'}`);

// Start Electron with the environment variables
const electronPath = require('electron');
const mainPath = path.resolve(__dirname, '..');

const child = spawn(electronPath, [mainPath], {
  stdio: 'inherit',
  env: {
    ...process.env,
    UI_HOST: process.env.UI_HOST || 'localhost',
    UI_PORT: process.env.UI_PORT || '5177',
    API_HOST: process.env.API_HOST || 'localhost',
    API_PORT: process.env.API_PORT || '3001',
    NODE_ENV: process.env.NODE_ENV || 'development',
  },
});

child.on('close', code => {
  process.exit(code);
});
