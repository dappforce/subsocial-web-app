#!/bin/bash

echo Delete @polkadot *.css files that cause errors during client compilation
> ./node_modules/@polkadot/ui-app/Button/Button.css
> ./node_modules/@polkadot/ui-app/Editor/style.css
> ./node_modules/@polkadot/ui-params/Params.css
> ./node_modules/@polkadot/ui-app/InputAddress/InputAddress.css
> ./node_modules/@polkadot/ui-app/InputExtrinsic/InputExtrinsic.css
