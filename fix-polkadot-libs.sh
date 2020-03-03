#!/bin/bash

cp -rf ./fixes/fixed-polkadot-ext.js ./node_modules/@polkadot/extension-dapp/index.js
cp -rf ./fixes/fixed-polkadot-ext.js ./node_modules/@subsocial/utils/node_modules/@polkadot/extension-dapp/index.js 
cp -rf ./fixes/fixed-polkadot-react-qr.js ./node_modules/@polkadot/react-qr/Scan.js
echo "Fixed window in polkadot js files. See ./fix-polkadot-libs.sh"