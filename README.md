<p align="center" width="100%">
  <h1 align="center">Hypersend</h1>
  <p align="center">
    <img alt="Hypersend logo" width="70" src="./assets/icons/favicon.png"/>
  </p>
  <p align="center">
    An easy-to-use, distributed, uber eats clone.
  </p>
  <p align="center">
    <img alt="GitHub Release" src="https://img.shields.io/github/v/release/lukas-houille/hypersend">
    <img alt="GitHub License" src="https://img.shields.io/github/license/lukas-houille/hypersend">
  </p>
</p>

## About The Project

Hypersend is a distributed food delivery service clone that brings your favorite meals from local restaurants right to your doorstep. Built with a microservices architecture, it ensures scalability, resilience, and maintainability.

## Project Architecture

The project is composed of several microservices, each responsible for a specific domain:

-   **Authentication Service**: Manages user authentication and authorization.
-   **Restaurant Service**: Handles restaurant data, menus, and orders.
-   **Driver Service**: Manages driver information and delivery assignments.
-   **Client Service**: Provides the main interface for customers to browse restaurants and place orders.
-   **Payment Service**: Processes payments for orders.
-   **Frontend Service**: The user interface for the application.

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

-   Docker
-   Docker Compose

### Quick Start

1.  Run the following command to set up and quick start the project:
    ```sh
    mkdir hypersend && cd hypersend && mkdir conf && \
    curl -o compose.yaml https://raw.githubusercontent.com/lukas-houille/hypersend/main/compose.yaml && \
    curl -o conf/init.sql https://raw.githubusercontent.com/lukas-houille/hypersend/main/conf/init.sql && \
    curl -o conf/Caddyfile https://raw.githubusercontent.com/lukas-houille/hypersend/main/conf/Caddyfile && \
    docker compose up -d && \
    open http://localhost
    ```
2.  The application will be available at `http://localhost`

### Step-by-Step Setup

1.  Clone the configuration files
2.  Edit the `compose.yaml` & `Caddyfile` file to configure the services as needed an credentials for the database.
3.  Start the application using Docker Compose:
    ```sh
    docker-compose up -d
    ```
4.  Access the application at `http://localhost`
    
    

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.
