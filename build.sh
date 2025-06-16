#!/bin/bash

# Install all dependencies including devDependencies
npm install --include=dev

# Build the frontend using npx to ensure vite is found
npx vite build

# Build the backend using npx to ensure esbuild is found
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build completed successfully!"