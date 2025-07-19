# Hypersend Auth Service

This service handles user authentication, including login, registration, and token management.

# Features
- User registration
- User login
- Token generation and validation

# API Endpoints

- `POST /api/auth/signup`: Register a new user
- `POST /api/auth/signin`: Authenticate a user and return a JWT

# Routes

- `GET /`: Accessible by anyone
- `GET /client/*`: Accessible by authenticated clients only
- `GET /driver/*`: Accessible by authenticated drivers only
- `GET /restaurant/*`: Accessible by authenticated restaurant owners only

# Technology Stack
- Node.js
- Express.js
- JWT for token management
- bcrypt for password hashing

# Installation

Docker image is available at [link](https://hub.docker.com/r/xentey/hypersend-user-auth) .

# Docker Compose

```yaml
version: '3.8'
services:
  user-auth:
    image: xentey/hypersend-user-auth:latest
    container_name: user-auth
    hostname: user-auth
    restart: unless-stopped
    environment::
      DB_HOST: # Database host, e.g., db
      DB_USER: # database user for auth service
      DB_PASSWORD: # database password for auth service
      DB_NAME: # database name, e.g., hypersend
      DB_PORT: # port number, e.g., 5432
      DB_SCHEMA: # database schema, e.g., public
      SECRET_KEY: # JWT secret key
    networks:
      - hypersend-network
 
networks:
    hypersend-network:
        driver: bridge
    ```
