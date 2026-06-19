#!/bin/bash
set -e

echo "🚀 Starting Ready Apologia Deployment to Cloudflare Pages..."

# Find the VS Code Server Node binary
NODE_BIN=$(ls -1d ~/.vscode-server/cli/servers/*/server/node | head -n 1)

if [ -z "$NODE_BIN" ]; then
    echo "❌ Error: Could not find VS Code Server Node binary."
    exit 1
fi

echo "📦 Compiling the 77,000+ pages (this will take a few minutes)..."
NODE_OPTIONS='--experimental-sqlite' "$NODE_BIN" ./node_modules/astro/astro.js build

echo "☁️ Deploying to Cloudflare Pages via Wrangler..."
# Using corepack yarn dlx to run wrangler without needing global installation
corepack yarn dlx wrangler pages deploy dist --project-name="ready-apologia"

echo "✅ Deployment process finished!"
