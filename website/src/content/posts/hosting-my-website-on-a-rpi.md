---
title: Hosting my website on an RPi 5 at home
description: Astro static website hosted on a RPi5 using Cloudflare Tunnel.
keywords:
  - raspberry pi
  - astro
  - static website
  - hosting
  - home lab
createdAt: 2025-12-12
updatedAt: 2025-12-12
---

## Hosting my website on an RPi 5 at home

<img alt="website hosting architecture" src="/images/website_hosting_rpi.png" />

### Why such a complex setup to host a simple website? 😅

I know there are plenty of services that can host a static website for free, but since I had an RPi 5 at home with spare capacity, I decided to do this mostly **for fun** and to play around with some tools.

The website will be hosted on a RPi 5 at home where I have **no public static IP** and **no ports exposed** on the public internet.

I want to maintain a **good DX**: make edits on my MacBook, push them to GitHub and that should trigger a new deployment without accessing the RPi directly, like a proper CI/CD setup.

### Domain setup

I bought the domain `mtt.engineer` on Cloudflare, which is also handling the nameservers and allows me to point the domain A record to a [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/).

This is how the DNS record should look if it’s correctly proxied to the tunnel.

<img alt="cloudflare dns with tunnel" src="/images/cloudflare_dns_tunnel.png" />

### RPi 5 setup

I have a [RaspberryPi 5](https://www.raspberrypi.com/products/raspberry-pi-5/) with [M.2 HAT + 256GB SSD](https://www.raspberrypi.com/products/ssd-kit/) connected via ethernet to my home network and I bought an external multi USB-C power adaptor as I have other RPis powered at the same time.

I'm using the standard Raspbian OS where I additionally installed `git`, `docker`, and `cloudflared`.

```sh
sudo apt-get update
sudo apt-get install git docker cloudflared
```

To set up the tunnel with `cloudflared`, I used the local managed tunnel mode by running `cloudflared tunnel create website`, where `website` is the name of my tunnel, and then followed the setup instructions.

Once everything has been set up correctly, you can verify that the tunnel is up and running on your Cloudflare dashboard.

<img alt="tunnel setup correctly" src="/images/tunnel_setup_correctly.png" />

Cloudflare is also configured to leverage `stale-while-revalidate` and serve cached responses when the origin is down.

### Simplest CI/CD

One of the requirements is to not expose the RPi to the public internet directly, so I can't have webhooks from GitHub reach the RPi when I push new code.

I briefly explored the idea of using [Woodpecker CI](https://woodpecker-ci.org), but it defaults to requiring connectivity with GitHub and a `redirect_url` to perform OAuth authentication, plus it seemed really overkill.

For this reason I need to adopt a polling solution where I check every 5 minutes if there are new updates by comparing the local `main` and remote `origin/main` SHA1.

If they don't match we trigger the build of the new image and deployment.

BONUS: I wanted to know once the operation is successful so I added a Telegram bot that sends me a message.

```bash
#!/bin/bash

cd /home/mattia/mtt.engineer
git fetch origin main

ORIGINAL_COMMIT=$(git rev-parse HEAD)
LOCAL=$(git rev-parse main)
REMOTE=$(git rev-parse origin/main)
TOKEN="" # telegram token
CHAT_ID="" # telegram chat_id

if [ "$LOCAL" != "$REMOTE" ]; then
  # pull latest changes
  git pull
  # rebuild docker image
  if ! docker build -t mtt-engineer .; then
    # if it fails reset to the original commit
    git reset --hard "$ORIGINAL_COMMIT"

    MESSAGE="❌ Failed to update website mtt.engineer"
    curl -s -X POST https://api.telegram.org/bot$TOKEN/sendMessage \
      -d chat_id=$CHAT_ID \
      -d text="$MESSAGE" > /dev/null
    exit 1
  fi
  # stop running container and start with the latest image
  docker stop mtt-engineer
  docker rm mtt-engineer
  docker run -d -p 3000:3000 \
    --restart unless-stopped \
    --name mtt-engineer mtt-engineer:latest
  # all good send a message
  MESSAGE="✅ Website mtt.engineer updated!"
  curl -s -X POST https://api.telegram.org/bot$TOKEN/sendMessage \
    -d chat_id=$CHAT_ID \
    -d text="$MESSAGE" > /dev/null
fi
```

Finally, create a cron job that runs every 5 minutes. Since the Docker commands require `sudo`, you must add this job to the root user's crontab.

```sh
sudo crontab -e
# add these lines at the end
*/5 * * * * /home/mattia/check-website-github.sh
```

Additionally I found that I needed to run the following to make sure git accepts the fact that the owner of the repo directory is not the root user.

```sh
sudo git config --global --add safe.directory /home/mattia/mtt.engineer
```

If all goes well I get a nice confirmation with my Telegram bot.

<img alt="telegram successful deployment message" src="/images/telegram_bot_success.png" />

Future improvements:

- make sure if the docker build fails that

All the code is available on my GitHub https://github.com/mtt87/mtt.engineer
