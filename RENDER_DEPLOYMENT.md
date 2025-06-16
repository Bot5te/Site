# Render Deployment Guide - CV Management System

## Problem: "vite: not found" Build Error

The error occurs because Render only installs production dependencies by default, but Vite and esbuild are in devDependencies.

## SOLUTION 1: Node.js Build Script (Most Reliable)

Use the custom Node.js build script:

**In Render Dashboard:**
1. **Build Command**: `node build-render.cjs`
2. **Start Command**: `npm run start`

This script automatically:
- Installs all dependencies including devDependencies
- Builds frontend with npx vite build
- Builds backend with npx esbuild
- Verifies build outputs

## SOLUTION 2: Manual Build Command

**In Render Dashboard, set Build Command to:**
```bash
npm install --include=dev && npx vite build && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
```

**Start Command:**
```bash
npm run start
```

## SOLUTION 3: Bash Script

**Build Command:** `./build.sh`
**Start Command:** `npm run start`

## SOLUTION 4: render.yaml (If supported)

The render.yaml file is included but may not be recognized by all Render configurations.

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