FROM node:12

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --production

COPY . .

CMD ["node", "dist/index.js"]