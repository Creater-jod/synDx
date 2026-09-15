#!/usr/bin/env bash
# Syndex - Automated Build & Deployment Helper
set -e

echo "========================================================"
echo "    Syndex Rare Disease AI - Automated Deployment       "
echo "========================================================"

# Step 1: Build Application
echo "[1/3] Compiling TypeScript & building client assets..."
npm run build

echo "[2/3] Verification check..."
npm run lint

echo "[3/3] Deployment targets available:"
echo "--------------------------------------------------------"
echo "1. Docker / Cloud Run Container:"
echo "   docker build -t syndx-app ."
echo "   docker run -p 3000:3000 syndx-app"
echo ""
echo "2. Local Express Full-Stack Server:"
echo "   npm start"
echo ""
echo "3. Google Cloud Run Automated Deploy:"
echo "   gcloud run deploy syndx-app --source ."
echo ""
echo "4. Vercel / Netlify SPA Deploy:"
echo "   npx vercel"
echo "--------------------------------------------------------"
echo "✅ Automated build verification completed successfully!"
echo "========================================================"
