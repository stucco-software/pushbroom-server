# This dockerfile must be built with the monorepo root directory as cwd
FROM node:lts-alpine

ENV ADAPTER_NODE=true

# all files needed for the build
COPY package.json .
COPY package-lock.json .
COPY svelte.config.js .
COPY vite.config.js .
COPY .env .

# all folders needed for the build
COPY src src/
COPY static static/

RUN npm install --frozen-lockfile

RUN npm run build

EXPOSE 3000

CMD ["node", "build"]