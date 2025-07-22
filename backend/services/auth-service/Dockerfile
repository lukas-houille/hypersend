FROM node:24-alpine
LABEL name="auth-service"
LABEL authors="lukashouille"
LABEL description="User authentication service"
LABEL version="1.0"
WORKDIR /app
COPY package.json ./
COPY tsconfig.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node","dist/server.js"]