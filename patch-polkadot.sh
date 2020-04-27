#!/bin/bash

echo "Delete Polkadot static assets"
> ./node_modules/@polkadot/ui-assets/empty.svg
> ./node_modules/@polkadot/ui-assets/chains/kusama-128.gif
> ./node_modules/@polkadot/ui-assets/centrifuge.png
> ./node_modules/@polkadot/ui-assets/edgeware-circle.svg
> ./node_modules/@polkadot/ui-assets/polkadot-circle.svg
> ./node_modules/@polkadot/ui-assets/polkadot-js.svg
> ./node_modules/@polkadot/ui-assets/substrate-hexagon.svg

echo "Patch Polkadot JS files with 'window'"
cp -rf ./fixes/fixed-polkadot-ext.js ./node_modules/@polkadot/extension-dapp/index.js
cp -rf ./fixes/fixed-polkadot-react-qr.js ./node_modules/@polkadot/react-qr/Scan.js
cp -rf ./fixes/fixed-polkadot-ext.js ./node_modules/@polkadot/react-components/node_modules/@polkadot/extension-dapp/index.js
cp -rf ./fixes/fixed-polkadot-ext.js ./node_modules/@polkadot/react-api/node_modules/@polkadot/extension-dapp/index.js