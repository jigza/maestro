#!/usr/bin/env node

/**
 * Quick test script to verify the refactored mode set structure
 */

const fs = require('fs');
const path = require('path');

// Check if a mode set name was provided
const args = process.argv.slice(2);
const modeSet = args[0] || 'all';

console.log(`Testing mode set: ${modeSet}`);

// Path to the mode set directory
const modeSetDir = path.join(process.cwd(), 'custom-sets', `${modeSet}-agent`);
const modeSetRoomodesPath = path.join(modeSetDir, '.roomodes');
const modeSetMaestroPath = path.join(modeSetDir, 'Maestro-mode.md');

// Legacy paths
const legacyRoomodesPath = path.join(process.cwd(), `.roomodes-${modeSet}`);
const legacyMaestroPath = path.join(process.cwd(), 'custom-sets', `Maestro-${modeSet}.md`);

console.log('\nChecking new directory structure:');
console.log(`Mode set directory: ${fs.existsSync(modeSetDir) ? 'EXISTS ✅' : 'MISSING ❌'}`);
console.log(`Mode set .roomodes: ${fs.existsSync(modeSetRoomodesPath) ? 'EXISTS ✅' : 'MISSING ❌'}`);
console.log(`Mode set Maestro-mode.md: ${fs.existsSync(modeSetMaestroPath) ? 'EXISTS ✅' : 'MISSING ❌'}`);

console.log('\nChecking legacy files:');
console.log(`Legacy .roomodes-${modeSet}: ${fs.existsSync(legacyRoomodesPath) ? 'EXISTS (can be removed)' : 'NOT FOUND (good)'}`);
console.log(`Legacy Maestro-${modeSet}.md: ${fs.existsSync(legacyMaestroPath) ? 'EXISTS (can be removed)' : 'NOT FOUND (good)'}`);

// Check if the .roomodes file can be parsed
if (fs.existsSync(modeSetRoomodesPath)) {
  try {
    const roomodesContent = fs.readFileSync(modeSetRoomodesPath, 'utf8');
    const roomodes = JSON.parse(roomodesContent);
    console.log(`\n.roomodes file is valid JSON and contains ${roomodes.customModes?.length || 0} modes`);
  } catch (err) {
    console.error(`Error parsing .roomodes file: ${err.message}`);
  }
}

console.log('\nTest complete');
