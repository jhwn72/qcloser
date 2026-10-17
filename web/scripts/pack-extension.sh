#!/bin/sh
# Packs the Chrome extension into web/public/q-extension.zip for the site's download button.
# Run before deploying whenever the extension changes. Leaves out the dev preview files.
set -e
cd "$(dirname "$0")/../.."
rm -f web/public/q-extension.zip
mkdir -p /tmp/q-pack && rm -rf /tmp/q-pack/q-extension && cp -R extension /tmp/q-pack/q-extension
rm -rf /tmp/q-pack/q-extension/dev
(cd /tmp/q-pack && zip -qr - q-extension) > web/public/q-extension.zip
rm -rf /tmp/q-pack
echo "Packed $(unzip -l web/public/q-extension.zip | tail -1 | awk '{print $2}') files into web/public/q-extension.zip"
