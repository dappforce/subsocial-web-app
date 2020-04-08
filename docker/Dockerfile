FROM ubuntu:18.04 as builder

RUN apt-get update \
    && apt-get install -y libusb-1.0-0-dev build-essential git curl gnupg gcc-4.8 g++-4.8 \
    && export CXX=g++-4.8

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install -y nodejs
RUN npm install yarn -g

COPY package.json yarn.lock* ./
RUN yarn install --no-optional

WORKDIR /app
COPY . .

RUN yarn
RUN ./fix-polkadot-libs.sh
RUN NODE_ENV=production yarn build

FROM node:10.13-slim

COPY --from=builder /app .kf

CMD bash -c "yarn start"
