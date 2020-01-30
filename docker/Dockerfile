FROM node:10.13-slim

COPY package.json yarn.lock* ./
RUN yarn install --no-optional

COPY . .
RUN yarn && yarn cache clean --force
RUN ./before-build-hack.sh
RUN NODE_ENV=production yarn build

CMD bash -c "yarn build && yarn start"
