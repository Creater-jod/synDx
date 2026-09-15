#!/usr/bin/env bash
# Syndex - Automated Project Setup & Installation Script
set -e

echo "========================================================"
echo "      Syndex Rare Disease AI - Automated Setup          "
echo "========================================================"

# 1. Check Node.js and npm version
echo "[1/4] Checking environment requirements..."
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js v18+."
    exit 1
fi

NODE_VER=$(node -v)
echo "   ✅ Node.js version: $NODE_VER"

if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed."
    exit 1
fi
echo "   ✅ npm version: $(npm -v)"

# 2. Environment Configuration
echo "[2/4] Setting up environment variables..."
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "   ✅ Created .env file from .env.example"
    else
        echo "GEMINI_API_KEY=" > .env
        echo "PORT=3000" >> .env
        echo "   ✅ Created default .env file"
    fi
else
    echo "   ✅ Existing .env file detected"
fi

# 3. Installing dependencies
echo "[3/4] Installing project npm dependencies..."
npm install

# 4. Building & Verification
echo "[4/4] Verifying TypeScript & building project..."
npm run build

echo "========================================================"
echo "🎉 Setup & Installation Complete Successfully!"
echo "========================================================"
echo "Commands to run locally or deploy:"
echo "  • Run Dev Server:       npm run dev"
echo "  • Run Full-Stack Prod:  npm start"
echo "  • Export Source Zip:    npm run export"
echo "  • Deploy Applet:        npm run deploy"
echo "========================================================"
