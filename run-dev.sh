#!/bin/bash

./fix-polkadot-libs.sh
node export-env.js
yarn run dev
