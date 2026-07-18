FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV WDS_SOCKET_PORT=0
EXPOSE 3000
CMD ["npm", "start"]