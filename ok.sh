#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 1 ] || [ -z "${1// }" ]; then
  echo 'Usage: ./ok.sh "commit message"'
  exit 1
fi

branch="$(git branch --show-current)"

if [ "${branch}" != "main" ]; then
  echo "Refusing to deploy from '${branch}'. Switch to main first."
  exit 1
fi

npm --prefix frontend run build
(
  cd backend
  php artisan test
)

git add -A

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

git commit -m "$1"
git push origin main

echo "Pushed to main. GitHub Actions will deploy production."
