FROM node:10-alpine
RUN mkdir -p /home/app/node_modules && chown -R node:node /home/app
WORKDIR /home/app
COPY package*.json ./
COPY build ./
USER node
RUN npm install
CMD [ "node", "src/main.js" ]
