# Subsocial Web UI by [DappForce](https://github.com/dappforce)

Subsocial is a set of Substrate pallets with web UI that allows anyone to launch their own decentralized censorship-resistant social network aka community. Every community can be a separate Substrate chain and connect with other communities via a Polkadot-based relay chain.

You can think of this as decentralized versions of Reddit, Stack Exchange or Medium, where subreddits or communities of Stack Exchange or blogs on Medium run on their own chain. At the same time, users of these decentralized communities should be able to share their reputation or transfer coins and other values from one community to another via Polkadot relay chain.

To learn more about Subsocial, please visit [Subsocial Network](http://subsocial.network).

## Supported by Web3 Foundation

<img src="https://github.com/dappforce/dappforce-subsocial/blob/master/w3f-badge.svg" width="100%" height="200" alt="Web3 Foundation grants badge" />

Subsocial is a recipient of the technical grant from Web3 Foundation. We have successfully delivered all three milestones described in Subsocial's grant application. [Official announcement](https://medium.com/web3foundation/web3-foundation-grants-wave-3-recipients-6426e77f1230).

## Video demo

[![Subsocial demo #4, 2019-11-28](http://i3.ytimg.com/vi/pFGvlKpJdss/maxresdefault.jpg)](https://www.youtube.com/watch?v=pFGvlKpJdss)

## Build with Docker

### Easy start
To start Subsocial web UI separately (you should have `docker-compose`):

```
cd docker/
docker-compose up -d
```

### Build your own image
If you want to build docker image from your local repository (it takes a while...), in your shell:

```
docker build -f docker/Dockerfile -t [your_nickname]/subsocial-ui .
```

### Start all parts of Subsocial at once with [Subsocial Starter](https://github.com/dappforce/dappforce-subsocial-starter).

## License

Subsocial is [GPL 3.0](./LICENSE) licensed.

