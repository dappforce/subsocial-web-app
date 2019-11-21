FROM node:10.13-slim as builder

COPY package.json yarn.lock* ./
RUN yarn install --no-optional

COPY . .
RUN yarn && yarn cache clean --force
RUN ./before-build-hack.sh
RUN NODE_ENV=production yarn build

FROM node:10.13-slim

WORKDIR /app
COPY --from=builder package.json tsconfig.json next.config.js babel.config.js ./
COPY --from=builder .next/ ./.next/
COPY --from=builder node_modules/ ./node_modules

EXPOSE 3000

CMD bash -c "yarn start-built"
