# Subsocial Web UI by [DappForce](https://github.com/dappforce)

Subsocial is a set of Substrate pallets with web UI that allows anyone to launch their own decentralized censorship-resistant social network aka community. Every community can be a separate Substrate chain and connect with other communities via a Polkadot-based relay chain.

You can think of this as decentralized versions of Reddit, Stack Exchange or Medium, where subreddits or communities of Stack Exchange or blogs on Medium run on their own chain. At the same time, users of these decentralized communities should be able to share their reputation or transfer coins and other values from one community to another via Polkadot relay chain.

To learn more about Subsocial, please visit [Subsocial Network](http://subsocial.network).

## Video demo

[![Subsocial demo #4, 2019-11-28](http://i3.ytimg.com/vi/pFGvlKpJdss/maxresdefault.jpg)](https://www.youtube.com/watch?v=pFGvlKpJdss)

## Run locally

If you want to develop Subsocial's web UI or just check it out locally, there is an easy way to do it.

Clone this repo:

```sh
git clone git@github.com:dappforce/dappforce-subsocial-ui.git
cd dappforce-subsocial-ui
```

Connect the app to Subsocial's server (Substrate node, IPFS):

```sh
cp subsocial-betanet.env .env
```

Install project dependencies:

```sh
yarn
```

### Option A: Run in a DEV mode

A dev mode supports hot reloads – this is very helpful when developing UI bacuse you can see changes in your browser without restarting the app. But it takes some time (in seconds) compile updated parts of the app, after you made changes to the source code.

```sh
./run-dev.sh
```

Go to [localhost:3003](http://localhost:3003)

### Option B: Run in a PROD mode

A prod mode doesn't support hot reloads, but works super fast, because UI gets compiled by Next.js before running.

```sh
yarn build
yarn start
```

Go to [localhost:3003](http://localhost:3003)

## Build with Docker

### Easy start

To start Subsocial web UI containerized (you should have `docker` installed):

```
docker run -d --rm --name subsocial-webui -p 3003:3003 dappforce/subsocial-ui:latest
```

### Start with `docker-compose`

This will start Subsocial web UI with an nginx support:

- Proxy web UI to the port `80`
- Proxy from `localhost/bc` to `localhost:3002` (where Polkadot.js Apps should be running)

```
docker-compose up -t docker/docker-compose.yml -d
```


### Build your own image

If you want to build docker image from your local repository (it takes a while...), in your shell:

```
docker build -f docker/Dockerfile -t [your_nickname]/subsocial-ui .
```

### Start all parts of Subsocial at once with [Subsocial Starter](https://github.com/dappforce/dappforce-subsocial-starter).

## License

Subsocial is [GPL 3.0](./LICENSE) licensed.
