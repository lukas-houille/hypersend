FROM node:24-alpine
LABEL authors="lukashouille"
LABEL description="User authentication service"
LABEL version="1.0"
WORKDIR /src
COPY ../package.json /src
COPY ../tsconfig.json /src
COPY ../src /src/src
RUN npm install && npm run build
EXPOSE 3322
CMD ["node","dist/server.js"]