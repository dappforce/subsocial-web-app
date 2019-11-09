FROM node:10.13-slim as builder

WORKDIR /subsocial-ui

COPY package.json package-lock.json* ./
RUN yarn install --no-optional

COPY . .
RUN yarn && yarn cache clean --force
RUN NODE_ENV=production yarn build

FROM node:10.13-slim

RUN apt-get update && apt-get -y install nginx

COPY --from=builder /subsocial-ui/packages/apps/build /var/www/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
