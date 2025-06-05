#!/usr/bin/env node

/**
 * Kuku Coach - Deployment Verification Script
 * Checks that all deployment requirements are met
 */

import fs from 'fs';

const requiredFiles = [
  'netlify.toml',
  'package.json',
  'vite.config.ts',
  'env.example',
  'dist/index.html',
  'dist/assets',
  'public/icon.ico'
];

const requiredPackageScripts = [
  'build',
  'preview'
];

console.log('🔍 Verifying Kuku Coach deployment readiness...\n');

// Check required files
console.log('📁 Checking required files:');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// Check package.json scripts
console.log('\n📦 Checking package.json scripts:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
let allScriptsExist = true;

requiredPackageScripts.forEach(script => {
  const exists = packageJson.scripts && packageJson.scripts[script];
  console.log(`  ${exists ? '✅' : '❌'} npm run ${script}`);
  if (!exists) allScriptsExist = false;
});

// Check dist folder
console.log('\n🏗️ Checking build output:');
const distExists = fs.existsSync('dist');
const distHasAssets = fs.existsSync('dist/assets');
console.log(`  ${distExists ? '✅' : '❌'} dist/ folder exists`);
console.log(`  ${distHasAssets ? '✅' : '❌'} dist/assets/ folder exists`);

// Check netlify.toml configuration
console.log('\n⚙️ Checking Netlify configuration:');
if (fs.existsSync('netlify.toml')) {
  const netlifyConfig = fs.readFileSync('netlify.toml', 'utf8');
  const hasRedirects = netlifyConfig.includes('[[redirects]]');
  const hasBuildCommand = netlifyConfig.includes('command = "npm run build"');
  const hasPublishDir = netlifyConfig.includes('publish = "dist"');
  
  console.log(`  ${hasRedirects ? '✅' : '❌'} SPA redirects configured`);
  console.log(`  ${hasBuildCommand ? '✅' : '❌'} Build command configured`);
  console.log(`  ${hasPublishDir ? '✅' : '❌'} Publish directory configured`);
} else {
  console.log('  ❌ netlify.toml not found');
}

console.log('\n' + '='.repeat(50));

if (allFilesExist && allScriptsExist && distExists) {
  console.log('🎉 SUCCESS: All deployment requirements met!');
  console.log('✅ Ready to deploy to Netlify');
  console.log('\n📋 Next steps:');
  console.log('1. Push to Git: git push origin main');
  console.log('2. Go to netlify.com and connect your repository');
  console.log('3. Set VITE_API_BASE_URL environment variable');
  console.log('4. Deploy and test!');
} else {
  console.log('❌ ISSUES FOUND: Please fix the issues above before deploying');
} 