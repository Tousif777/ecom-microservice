#!/bin/bash

echo "🚀 Setting up E-commerce Microservices"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists docker; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ All prerequisites are installed"

# Install dependencies for all services
echo "📦 Installing dependencies for all services..."

services=("api-gateway" "user-service" "product-service" "order-service" "payment-service" "notification-service")

for service in "${services[@]}"; do
    echo "Installing dependencies for $service..."
    cd "services/$service"
    npm install
    cd "../.."
done

echo "✅ All dependencies installed"

# Create environment files
echo "🔧 Creating environment files..."

for service in "${services[@]}"; do
    if [ -f "services/$service/.env.example" ]; then
        if [ ! -f "services/$service/.env" ]; then
            cp "services/$service/.env.example" "services/$service/.env"
            echo "Created .env file for $service"
        else
            echo ".env file already exists for $service"
        fi
    fi
done

echo "✅ Environment files created"

# Start all services
echo "🚀 Starting all services..."
docker compose up -d --build

# Generate Prisma clients
echo "🔧 Generating Prisma clients..."

prisma_services=("user-service" "product-service" "order-service" "payment-service")

for service in "${prisma_services[@]}"; do
    echo "Generating Prisma client for $service..."
    cd "services/$service"
    npx prisma generate
    cd "../.."
done

echo "✅ Prisma clients generated"

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 15

# Create database schemas
echo "🗃️ Creating database schemas..."
docker compose exec -T postgres psql -U admin -d myapp -f /docker-entrypoint-initdb.d/init-schemas.sql

# Push database schemas
echo "📤 Pushing database schemas..."

for service in "${prisma_services[@]}"; do
    echo "Pushing schema for $service..."
    cd "services/$service"
    npx prisma db push
    cd "../.."
done

echo "✅ Database schemas pushed"

# Verify setup
echo "🔍 Verifying setup..."
echo "Checking database schemas..."
docker compose exec -T postgres psql -U admin -d myapp -c "SELECT schemaname FROM information_schema.schemata WHERE schemaname LIKE '%_service';"

echo "Testing service health..."
sleep 5
echo "API Gateway health:"
curl -s http://localhost:3000/health | grep -o '"status":"[^"]*"' || echo "Starting up..."

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. All services are already running via Docker Compose"
echo "2. Or restart all services: docker compose restart"
echo "3. Or stop all services: docker compose down"
echo ""
echo "🧪 Test the APIs:"
echo "- Register user: curl -X POST http://localhost:3000/api/users/register -H 'Content-Type: application/json' -d '{\"firstName\":\"Test\",\"lastName\":\"User\",\"email\":\"test@example.com\",\"password\":\"password123\"}'"
echo "- Create product: curl -X POST http://localhost:3000/api/products -H 'Content-Type: application/json' -d '{\"name\":\"Test Product\",\"price\":99.99,\"category\":\"Test\",\"sku\":\"TEST-001\"}'"
echo ""
echo "🌐 Service URLs:"
echo "- API Gateway: http://localhost:3000"
echo "- User Service: http://localhost:3001"
echo "- Product Service: http://localhost:3002"
echo "- Order Service: http://localhost:3003"
echo "- Payment Service: http://localhost:3004"
echo "- Notification Service: http://localhost:3005"
echo ""
echo "🔧 Management UIs:"
echo "- RabbitMQ Management: http://localhost:15672 (admin/admin123)"
echo "- MailHog Web UI: http://localhost:8025"
echo ""
echo "🚀 Happy coding!"
