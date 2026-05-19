# RoLab LMS

Learning Management System built with Go + React + PostgreSQL + Docker.

## Quick Start

```bash
# Copy env file
cp .env.example .env

# Start all services
docker-compose up -d

# Seed demo data (run once)
cd backend && go run cmd/seed/main.go
```

## URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080/api/v1 |
| Swagger UI | http://localhost:8080/swagger/index.html |

## Admin Login

- Email: `admin@rolab.kz`
- Password: `admin123`

## Development

```bash
# Backend only
cd backend && go run cmd/server/main.go

# Frontend only
cd frontend && npm run dev

# Regenerate Swagger
cd backend && swag init -g cmd/server/main.go -o docs
```

## Stack

- **Backend**: Go + Gin + GORM + PostgreSQL + Swagger (swaggo)
- **Frontend**: React + Vite + TypeScript + Mantine UI + React Query
- **Auth**: JWT
- **Infra**: Docker + Docker Compose
