.PHONY: fe be infra restart-fe restart-be restart-all stop-fe stop-be stop-all logs-fe logs-be

# Frontend (Next.js)
fe:
	cd frontend && npm run dev

# Backend (Spring Boot)
be:
	cd backend && ./gradlew bootRun

# Infrastructure (Docker)
infra:
	docker-compose up -d

infra-down:
	docker-compose down

# Restart commands
restart-fe:
	@echo "🔄 Restarting Frontend..."
	@pkill -f "next dev" || true
	@sleep 1
	@cd frontend && npm run dev &
	@echo "✅ Frontend restarted"

restart-be:
	@echo "🔄 Restarting Backend..."
	@pkill -f "gradlew" || true
	@pkill -f "bootRun" || true
	@sleep 2
	@cd backend && ./gradlew bootRun &
	@echo "✅ Backend restarted"

restart-all: restart-be restart-fe
	@echo "✅ All services restarted"

# Stop commands
stop-fe:
	@echo "⏹️  Stopping Frontend..."
	@pkill -f "next dev" || true
	@echo "✅ Frontend stopped"

stop-be:
	@echo "⏹️  Stopping Backend..."
	@pkill -f "gradlew" || true
	@pkill -f "bootRun" || true
	@echo "✅ Backend stopped"

stop-all: stop-fe stop-be
	@echo "✅ All services stopped"

# Start both (in foreground - use tmux or separate terminals)
dev:
	@echo "Starting infrastructure..."
	docker-compose up -d
	@echo "Use 'make fe' and 'make be' in separate terminals"

# Install dependencies
install:
	cd frontend && npm install
	cd backend && ./gradlew dependencies

# Help
help:
	@echo "Available commands:"
	@echo "  make fe          - Start frontend (Next.js)"
	@echo "  make be          - Start backend (Spring Boot)"
	@echo "  make infra       - Start infrastructure (Docker)"
	@echo "  make infra-down  - Stop infrastructure"
	@echo "  make restart-fe  - Restart frontend"
	@echo "  make restart-be  - Restart backend"
	@echo "  make restart-all - Restart both FE and BE"
	@echo "  make stop-fe     - Stop frontend"
	@echo "  make stop-be     - Stop backend"
	@echo "  make stop-all    - Stop all services"
	@echo "  make dev         - Start infra and show instructions"
	@echo "  make install     - Install all dependencies"
