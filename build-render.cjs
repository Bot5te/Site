#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Starting Render build process...');

try {
  // Install all dependencies including devDependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install --include=dev', { stdio: 'inherit' });

  // Build frontend with Vite
  console.log('🎨 Building frontend...');
  execSync('npx vite build', { stdio: 'inherit' });

  // Build backend with esbuild
  console.log('⚙️ Building backend...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });

  // Verify build outputs
  const frontendExists = fs.existsSync(path.join(__dirname, 'dist', 'public'));
  const backendExists = fs.existsSync(path.join(__dirname, 'dist', 'index.js'));

  if (!frontendExists) {
    throw new Error('Frontend build failed: dist/public directory not found');
  }

  if (!backendExists) {
    throw new Error('Backend build failed: dist/index.js not found');
  }

  console.log('✅ Build completed successfully!');
  console.log('📁 Frontend built to: dist/public/');
  console.log('📁 Backend built to: dist/index.js');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}