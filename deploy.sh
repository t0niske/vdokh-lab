#!/bin/sh
# Выкладка Aromé на свой сервер: сборка под arome-marketing.kz → /var/www/arome (nginx).
set -e
cd "$(dirname "$0")"
SITE=prod node build.js
tar -czf - -C dist-prod . | ssh ubuntu@87.199.130.157 'set -e; rm -rf /tmp/arome-new; mkdir /tmp/arome-new; tar -xzf - -C /tmp/arome-new; sudo rsync -a --delete /tmp/arome-new/ /var/www/arome/; rm -rf /tmp/arome-new'
echo "выложено: https://arome-marketing.kz/"
