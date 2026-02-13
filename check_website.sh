#!/bin/bash
set -e

echo $(date)

cd /home/mattia/mtt.engineer
git fetch origin main

ORIGINAL_COMMIT=$(git rev-parse HEAD)
LOCAL=$(git rev-parse main)
REMOTE=$(git rev-parse origin/main)
TOKEN=""
CHAT_ID=""
ZONE_ID=""
CLOUDFLARE_TOKEN=""

if [ "$LOCAL" != "$REMOTE" ]; then
  # get latest changes
  git pull

  if ! docker build -t mtt-engineer .; then
    echo "❌ Docker build failed — reverting repository..."
    git reset --hard "$ORIGINAL_COMMIT"

    MESSAGE="❌ Failed to update website mtt.engineer"
    curl -s -X POST https://api.telegram.org/bot$TOKEN/sendMessage -d chat_id=$CHAT_ID -d text="$MESSAGE" > /dev/null
    exit 1
  fi

  # rebuild docker image
  docker build -t mtt-engineer .

  # stop running container
  docker stop mtt-engineer
  docker rm mtt-engineer
  docker run -d -p 3000:3000 --restart unless-stopped --name mtt-engineer mtt-engineer:latest

  MESSAGE="✅ Website mtt.engineer updated!"
  curl -s -X POST https://api.telegram.org/bot$TOKEN/sendMessage -d chat_id=$CHAT_ID -d text="$MESSAGE" > /dev/null

  # purge cloudflare cache
  curl https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $CLOUDFLARE_TOKEN" \
    -d '{"purge_everything": true}'
fi
