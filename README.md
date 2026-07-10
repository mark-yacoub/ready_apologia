# Ready Apologia

Ready Apologia is a mobile-first, high-speed "field manual" web application designed for Christian evangelists. It allows users to quickly find scriptural proofs, answers to objections, manuscript evidence, and theological explanations while actively engaging in the field.

---

## 🚀 Getting Started

### 1. Installation
All package commands use **Yarn v1** (via Node Corepack) to prevent permission errors on restricted workstations.

```bash
corepack yarn install
```

### 2. Initialize the Database
To set up the local SQLite database with sample apologetics data for testing, run:

```bash
node --experimental-sqlite scripts/init_db.js
```
This generates a `data.db` file in the root directory.

---

## 🖥️ Running the App

### Option A: Development Mode (Recommended for Editing)
Starts the Astro development server with Hot Module Replacement (live editing).

```bash
corepack yarn dev
```
*   **URL:** `http://localhost:4321`
*   *Troubleshooting:* If port `4321` is blocked on your workstation, you can force a different port: `corepack yarn dev --port 8081`. If accessing via SSH tunnel, bind to all interfaces using `corepack yarn dev --host`.

### Option B: Production Static Build
Compiles the React components and queries the local SQLite database at build time, baking everything into 100% static HTML/JSON files in the `dist/` directory.

```bash
corepack yarn build
```

### Option C: Zero-Dependency Static Preview (Workstation Safe)
Serves the production-compiled `dist/` folder locally using a lightweight script that uses **only Node.js core modules** (`http` and `fs`). This requires zero external packages to run.

```bash
corepack yarn serve
# Or run directly with Node:
node scripts/serve.js
```
*   **URL:** `http://localhost:8080`
*   *Troubleshooting:* Override the default port using `PORT=9090 node scripts/serve.js`.

---

## 🛑 Stopping the App (Killing the Process)

### 1. If running in your active terminal
Simply press **`Ctrl + C`** in the terminal window where the server is running.

### 2. If running in the background (or port is stuck)
If the app was started in the background or the port is stuck, you can find and terminate the process manually.

#### Find the Process ID (PID) using the Port:
Run this to see what is running on the Astro port (`4321`) or the static server port (`8080`):
```bash
lsof -i :4321
# or
lsof -i :8080
```

This will output something like:
```
COMMAND    PID       USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
node    426093 markyacoub   19u  IPv4 658128      0t0  TCP *:4321 (LISTEN)
```

#### Kill the Process:
Take the **PID** (e.g., `426093` from the example above) and run:
```bash
kill -9 <PID>
# Example: kill -9 426093
```

#### Quick "Kill All" Shortcut:
To terminate any running Astro development servers instantly:
```bash
pkill -f astro
```

---

## 📂 Repository Map
*   `.gitignore`: Standard Git exclusion rules for node dependencies and build outputs.
*   `data.db`: SQLite database containing apologetics and manuscript metadata.
*   `docs/db_schema.sql`: SQL schema definitions for the SQLite database.
*   `scripts/import_scripture.js`: Script to import NASB (NT) and LXX (OT) JSON scriptures into the repository.
*   `scripts/copy_sample_images.js`: Script to recursively search and copy sample manuscript images from the big data collection.
*   `scripts/serve.js`: Zero-dependency HTTP server.
*   `src/db.js`: Database helper utilizing built-in Node 22 `node:sqlite`.
*   `src/data/scripture/`: Imported NASB (NT) and LXX (OT) scripture JSON files.
*   `public/images/manuscripts/`: Local mock folder containing a few sample manuscript scans for development.
*   `src/pages/`: Page templates for Bible reader, Quran reader, Quran verse evidence drawers, and Companion Codices.
*   `src/components/`: Interactive React elements and Astro components (e.g. Quran special pages, headers, and evidence tabs).
*   `src/utils/`: Helper utilities for loading scripture, topics, non-Uthmanic Quran data, and apologetic evidence (debunking miracles, contradictions, scientific errors).
*   `src/data/quran/debunking/`: Dataset for debunked Quranic scientific miracles.
*   `docs/adr/`: [Architectural Decision Records (ADRs)](file:///usr/local/google/home/markyacoub/Documents/ready_apologia/docs/adr/0001-framework-and-offline-strategy.md) detailing the technology choices.

## 🗺️ Route Map
| Route | Description |
| :--- | :--- |
| `/quran` | Evidence & Filters Home (Qiraat & Competing Codices access) |
| `/quran/[surah]` | Quran reader with Uthmanic Arabic and English translation |
| `/quran/[surah]/[ayah]/[tab]` | Quran verse evidence drawer (Debunking Miracles, Scientific Errors, Contradictions, Footnotes, Commentaries, Manuscripts) |
| `/quran/variant/[slug]` | Dynamic page showing all verses affected by a specific Qiraat effect or category |
| `/quran/codex/[companion]` | Deep-dive into a companion's non-Uthmanic codex (e.g., Ubayy, Ibn Masud) |
| `/quran/0` | Special route rendering verses historically reported but lost/abrogated |
