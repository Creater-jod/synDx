# synDx — Review Console

An interactive diagnostic case review and decision platform built for clinical reviewers.

## Project Structure

```
SYNDX/
├── index.html            # Main HTML document
├── css/
│   └── styles.css        # Custom dark mode UI theme & components
├── js/
│   ├── data.js           # Case dataset, REST API client & state
│   ├── queue.js          # Queue view & case details controller
│   ├── analytics.js      # Analytics metrics & visual bar graphs
│   ├── audit.js          # Cryptographic hash audit log search
│   └── app.js            # Main application router
├── server.js             # Express Node.js local host server & REST endpoints
├── package.json          # Node dependencies and execution scripts
└── README.md             # Project documentation
```

## Running on Localhost

### Prerequisites
- Node.js (v16+) installed.

### Steps to Run
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the local server:
   ```bash
   npm start
   ```

3. Open your browser at:
   [http://localhost:3000](http://localhost:3000)

## API Endpoints

- `GET /api/cases` — Retrieve all cases.
- `POST /api/cases/:id/decision` — Submit a reviewer decision (`status`: `confirmed` | `more-tests` | `overridden`, `note`: `string`).
