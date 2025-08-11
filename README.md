# Node.js + PostgreSQL Dockerized Application

A simple REST API built with Node.js, Express, and PostgreSQL, containerized with Docker.

## Features

- 🐳 Docker and Docker Compose setup
- 🏗️ Pre-configured PostgreSQL database
- 🔌 Environment variables configuration
- 🔄 Automatic database initialization
- 📦 Easy dependency management

## Prerequisites

- Docker 20.10+
- Docker Compose 1.29+
- Node.js 18+ (optional for local development)

## Quick Start

1. Clone the repository:
   ```bash
   git clone [your-repo-url]
   cd [your-repo-name]
   ```
2. Running the Application

   ```bash
   # Start all services in detached mode
   docker-compose up --build
   ```

   ```bash
   # Follow logs
   docker-compose logs -f
   ```
