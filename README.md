# E-commerce Microservices Backend

A scalable microservices architecture for an e-commerce platform built with Node.js, Express, PostgreSQL, Redis, and RabbitMQ.

## Architecture Overview

This project consists of the following microservices:

- **API Gateway** (Port 3000) - Routes requests to appropriate services
- **User Service** (Port 3001) - User authentication, registration, profile management
- **Product Service** (Port 3002) - Product catalog, inventory management
- **Order Service** (Port 3003) - Order processing, order history
- **Payment Service** (Port 3004) - Payment processing, transaction management
- **Notification Service** (Port 3005) - Email notifications, messaging

## Infrastructure

- **PostgreSQL** - Primary database (with schema separation per service)
- **Redis** - Caching and session storage
- **RabbitMQ** - Message broker for inter-service communication
- **MailHog** - Email testing in development

## 🚀 Quick Start (After Cloning)

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ & npm
- Git

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ecom-microservice
   ```

2. **Run the automated setup script**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```
   
   This script will:
   - ✅ Check prerequisites
   - 📦 Install dependencies for all services
   - 🔧 Create environment files
   - 🚀 Start all services with Docker Compose
   - 🗃️ Create database schemas for each service
   - 📤 Push Prisma schemas to database
   - 🔍 Verify the setup

3. **Verify everything is running**
   ```bash
   # Check all containers are running
   docker compose ps
   
   # Test API Gateway
   curl http://localhost:3000/health
   ```

## 🧪 Quick API Tests

### Register a User
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Create a Product
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "A test product",
    "price": 99.99,
    "category": "Test",
    "sku": "TEST-001",
    "stock": 100
  }'
```

## 🌐 Service URLs

- **API Gateway**: http://localhost:3000 (routes all requests)
- **User Service**: http://localhost:3001  
- **Product Service**: http://localhost:3002
- **Order Service**: http://localhost:3003
- **Payment Service**: http://localhost:3004
- **Notification Service**: http://localhost:3005

## 🔧 Management UIs

- **RabbitMQ Management**: http://localhost:15672 (admin/admin123)
- **MailHog Web UI**: http://localhost:8025

## 📋 API Endpoints

All requests go through the API Gateway at `http://localhost:3000`

### 👤 User Service
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login  
- `GET /api/users/profile` - Get user profile (requires auth)
- `PUT /api/users/profile` - Update user profile (requires auth)

### 📦 Product Service
- `GET /api/products` - List all products (with pagination, search, category filter)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### 🛒 Order Service
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status

### 💳 Payment Service
- `POST /api/payments/process` - Process payment
- `GET /api/payments/:id` - Get payment details

### 📧 Notification Service
- `POST /api/notifications/email` - Send email notification

## 🛠️ Development Commands

```bash
# One-time setup (after cloning)
npm run setup
# OR manually: ./setup.sh

# Start/stop services
npm start              # Start all services
npm stop               # Stop all services  
npm restart            # Restart all services
npm run dev            # Start with rebuild

# Monitoring
npm run status         # Check service status
npm run logs           # View all logs
docker compose logs -f user-service  # View specific service logs

# Database access
docker compose exec postgres psql -U admin -d myapp

# Reset everything (removes all data!)
npm run clean
```

## 🗃️ Database Architecture

Each service has its own PostgreSQL schema for complete isolation:
- `user_service` - Users table
- `product_service` - Products table  
- `order_service` - Orders and OrderItems tables
- `payment_service` - Payments table

This ensures:
- ✅ No cross-service table conflicts
- ✅ Safe schema migrations per service
- ✅ Cost-effective single database
- ✅ Proper microservice isolation
