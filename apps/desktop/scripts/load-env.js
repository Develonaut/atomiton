#!/usr/bin/env node

// Load environment variables from root .env file for Electron
const path = require('path');
const dotenv = require('dotenv');

// Load from root .env file
const rootEnvPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: rootEnvPath });

// Log loaded configuration for debugging
console.log('[Electron] Environment variables loaded:');
console.log(`  UI_HOST: ${process.env.UI_HOST || 'localhost'}`);
console.log(`  UI_PORT: ${process.env.UI_PORT || '5177'}`);
console.log(`  API_HOST: ${process.env.API_HOST || 'localhost'}`);
console.log(`  API_PORT: ${process.env.API_PORT || '3001'}`);
