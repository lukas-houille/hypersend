FROM node:24-alpine
LABEL authors="lukashouille"
LABEL description="User authentication service"
LABEL version="1.0"
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
CMD ["node","server.js"]