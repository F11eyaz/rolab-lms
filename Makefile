.PHONY: up down build seed swagger dev-backend dev-frontend

up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose build

seed:
	cd backend && go run cmd/seed/main.go

swagger:
	cd backend && swag init -g cmd/server/main.go -o docs

dev-backend:
	cd backend && go run cmd/server/main.go

dev-frontend:
	cd frontend && npm run dev
