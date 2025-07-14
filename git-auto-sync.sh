#!/bin/bash
# filepath: /Users/sugisaku/Developer/Deep-School/git-auto-sync.sh

REPO_PATH="/Users/sugisaku/Developer/Deep-School"
cd "$REPO_PATH"

echo "Watching for new commits..."

LAST_COMMIT=""

while true; do
  NEW_COMMIT=$(git rev-parse HEAD 2>/dev/null)
  if [[ "$NEW_COMMIT" != "$LAST_COMMIT" ]]; then
    if [[ -n "$LAST_COMMIT" ]]; then
      echo "New commit detected. Pushing to remote..."
      git push
    fi
    LAST_COMMIT="$NEW_COMMIT"
  fi
  sleep 2
done