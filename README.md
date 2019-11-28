# SubSocial web UI by [DappForce](https://github.com/dappforce)

SubSocial is a set of Substrate runtime modules (SRML) with UI that would allow anyone to launch their own decentralized censorship-resistant social network aka community. We are planning to follow a topology of Polkadot Network where every community will be running on its own Substrate chain and all these decentralized communities will be connected to our own Polkadot relay. This social networking relay could be connected to the official Polkadot Network.

You can think of this as decentralized versions of Reddit, Stack Exchange or Medium, where subreddits or communities of Stack Exchange or blogs on Medium run on their own chain. At the same time, users of these decentralized communities should be able to transfer or share their reputation, coins and other values from one community to another via Polkadot relay.

[![Subsocial demo #4, 2019-11-28](http://i3.ytimg.com/vi/pFGvlKpJdss/hqdefault.jpg)](https://www.youtube.com/watch?v=pFGvlKpJdss)

## Building from Docker

### Easiest start
To start Subsocial web UI separately (you should have docker-compose):

```
cd docker/
docker-compose up -d
```

### Build your own image
If you want to build docker image from your local repository (it takes a while...), in your shell:

```
docker build -f docker/Dockerfile -t [your_nickname]/subsocial-ui .
```

### Start all parts of Subsocial at once with [Subsocial-Starter](https://github.com/dappforce/dappforce-subsocial-starter)
