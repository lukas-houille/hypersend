FROM node:24-alpine
LABEL authors="lukashouille"
LABEL description="User authentication service"
LABEL version="1.0"
WORKDIR /src
COPY backend/services/client-service/package.json ./
COPY backend/services/client-service/tsconfig.json ./
COPY backend/services/client-service/src ./src
COPY backend/services/rabbit-service ./rabbit-service

RUN npm install && npm run build
EXPOSE 3000
CMD ["node","dist/server.js"]