# Syndex — Rare Disease AI Triage & Clinical Decision System

Syndex is an advanced edge-AI decision support platform built for rare disease diagnosis, HPO symptom mapping, biomarker evaluation, offline GIS referral routing, and zero-trust audit ledgers.

---

## ⚡ Quick Start: Automated Workflow

### 1. 📦 Export Source Code
To generate a clean zip archive of the entire source code (excluding `node_modules` and build outputs):
```bash
npm run export
# Or directly:
bash export.sh
```
*Output file:* `syndx-rare-disease-ai-source.zip`

---

### 2. 🛠️ Automated Setup & Installation
Run the automated setup script to check Node.js versions, copy environment templates, install dependencies, and compile TypeScript:
```bash
npm run setup
# Or directly:
bash setup.sh
```

#### Manual Setup Steps
If you prefer running manual commands:
```bash
# 1. Clone or extract source code
cd syndx

# 2. Copy environment template
cp .env.example .env

# 3. Install dependencies
npm install

# 4. Verify TypeScript build
npm run lint
npm run build
```

---

### 3. 🚀 Running Locally

#### Development Mode (Vite Hot-Reload)
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Production Mode (Full-Stack Express + Edge AI API)
```bash
npm run build
npm start
```
Runs the Express backend with server-side AI proxy routes on `http://localhost:3000`.

---

### 4. 🌐 Deployment Options

#### Option A: Docker / Container Deployment (Cloud Run / AWS / GCP)
```bash
# Build Docker image
docker build -t syndx-app .

# Run locally with Docker
docker run -p 3000:3000 -e GEMINI_API_KEY="your_api_key_here" syndx-app
```

#### Option B: Google Cloud Run (Automated CLI)
```bash
# Deploy directly to GCP Cloud Run
gcloud run deploy syndx-app --source . --port 3000 --allow-unauthenticated
```

#### Option C: Automated Deploy Helper Script
```bash
npm run deploy
```

---

## 📁 Repository Architecture
```
├── setup.sh             # Automated setup & dependency check script
├── export.sh            # Source code zip generator
├── deploy.sh            # Automated deployment helper
├── Dockerfile           # Production multi-stage Docker file
├── server.ts            # Express full-stack backend & Gemini API proxy
├── src/
│   ├── App.tsx          # Main application & Push/Pop Navigation Stack
│   ├── pages/           # Syndex Dashboard & Primary Modules
│   ├── components/      # UI components & Export/Deployment Hub
│   ├── screens/        # Clinical Intake, Doctor Console, History
│   └── index.css        # Liquid Glass UI styling utilities
└── package.json         # Scripts and project dependencies
```
