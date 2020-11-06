#!/bin/bash

echo "Patch Polkadot JS files with 'window'"
cp -rf ./fixes/fixed-polkadot-ext.js ./node_modules/@polkadot/extension-dapp/index.js
