#!/bin/bash

# Install all dependencies including devDependencies
npm install --include=dev

# Build the application
npm run build

echo "Build completed successfully!"