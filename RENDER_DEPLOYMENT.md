# Render Deployment Guide

## Quick Fix for Build Error

The "vite: not found" error occurs because Render only installs production dependencies by default. Here are the solutions:

### Option 1: Using render.yaml (Recommended)

Use the `render.yaml` file in your repository with this configuration:

```yaml
services:
  - type: web
    name: cv-management-app
    env: node
    buildCommand: npm install --include=dev && npx vite build && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
    startCommand: npm run start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        value: your-mongodb-connection-string
```

### Option 2: Manual Render Dashboard Configuration

In your Render service settings:

1. **Build Command**: `npm install --include=dev && npx vite build && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist`
2. **Start Command**: `npm run start`
3. **Environment Variables**:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = your MongoDB connection string

### Option 3: Using Custom Build Script

Use the included `build.sh` script:

1. **Build Command**: `./build.sh`
2. **Start Command**: `npm run start`

## Required Environment Variables

Set these in your Render service:

- `MONGODB_URI`: Your MongoDB Atlas connection string
- `NODE_ENV`: Set to `production`

## MongoDB Setup

1. Create a MongoDB Atlas cluster
2. Get your connection string
3. Replace `<username>`, `<password>`, and `<cluster>` with your actual values
4. Add your Render service IP to MongoDB Atlas whitelist (or use 0.0.0.0/0 for all IPs)

## File Structure

The build process creates:
- `dist/public/` - Frontend build output
- `dist/index.js` - Backend bundle

## Port Configuration

The application runs on port 5000, but Render automatically handles port mapping.

## Troubleshooting

- **Build fails**: Ensure `--include=dev` is in your build command
- **Database connection fails**: Check your MongoDB URI and network access
- **Files not serving**: Verify the build output is in `dist/public/`