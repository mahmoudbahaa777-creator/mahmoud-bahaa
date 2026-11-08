#!/usr/bin/env bash
# Build the site for GitHub Pages and publish it to the gh-pages branch.
# Usage: npm run deploy
set -euo pipefail
cd "$(dirname "$0")/.."
REMOTE=$(git remote get-url origin)
GITHUB_PAGES=1 npx vite build
touch dist/.nojekyll            # serve files as-is (no Jekyll processing)
cd dist
rm -rf .git
git init -q -b gh-pages
git add -A
git -c user.name="$(git -C .. config user.name)" -c user.email="$(git -C .. config user.email)" \
  commit -q -m "Deploy $(git -C .. rev-parse --short HEAD)"
git push -q -f "$REMOTE" gh-pages
rm -rf .git
echo "Deployed → https://mahmoudbahaa777-creator.github.io/mahmoud-bahaa/"
