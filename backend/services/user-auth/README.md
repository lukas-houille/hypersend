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

Docker image is available at [link] TODO: Add link to Docker image .