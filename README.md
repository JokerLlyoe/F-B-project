# F&B Ordering System

A scalable REST API for food & beverage ordering built with NestJS, TypeScript, PostgreSQL, TypeORM, and RabbitMQ.

## Features

- Menu Management - Browse and manage menu items
- Order Processing - Create and manage customer orders  
- Status Tracking - Track order status (received → preparing → ready → completed)
- Event-Driven - RabbitMQ integration for asynchronous event publishing
- Scalable Architecture - Modular monolith designed for 1M+ users

## Prerequisites

- Node.js (v18+)
- PostgreSQL (v15+)
- RabbitMQ (v3.12+)

## Installation

```bash
npm install
cp .env.example .env
```

## Database Setup

### 1. Install PostgreSQL
```bash
# Windows: Download from https://www.postgresql.org/download/windows/
# MacOS: brew install postgresql@15
# Linux: sudo apt install postgresql postgresql-contrib
```

### 2. Create Database
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE foodbeverage_system;

# Create user (optional)
CREATE USER fb_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE foodbeverage_system TO fb_user;
\q
```

### 3. Configure Environment
Edit `.env` file:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=foodbeverage_system
DB_USER=postgres
DB_PASSWORD=your_password
```

### 4. Run Migrations
```bash
npm run migration:run
```

### 5. Seed Database (Optional)
```bash
node seed-coffee-shop.js
```

## RabbitMQ Setup

### 1. Install RabbitMQ
```bash
# Windows: Download from https://www.rabbitmq.com/download.html
# MacOS: brew install rabbitmq
# Linux: sudo apt install rabbitmq-server
```

### 2. Start RabbitMQ Service
```bash
# Windows: Start RabbitMQ service from Services
# MacOS: brew services start rabbitmq
# Linux: sudo systemctl start rabbitmq-server
```

### 3. Enable Management Plugin (Optional)
```bash
rabbitmq-plugins enable rabbitmq_management
# Access UI at http://localhost:15672 (guest/guest)
```

### 4. Configure Environment
Edit `.env` file:
```env
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
```

## Run Application

```bash
npm run start:dev
```

## API Reference

### Menu API (`/api/v1/menu`)

#### GET `/api/v1/menu` - List menu items (grouped by category)
```bash
# Query params
?available=true          # Filter available items
?category=<uuid>          # Filter by category ID  
?search=<term>            # Search name/description
```

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Milk Tea Series",
        "description": "Premium milk tea",
        "displayOrder": 0,
        "menuItems": [
          {
            "id": "uuid",
            "name": "Classic Milk Tea",
            "description": "Premium Ceylon tea",
            "price": 8.50,
            "stockCount": 100,
            "imageUrl": "https://...",
            "isAvailable": true
          }
        ]
      }
    ]
  }
}
```

#### GET `/api/v1/menu/:id` - Get specific menu item
```bash
GET /api/v1/menu/uuid
```

#### PATCH `/api/v1/menu/:id` - Update menu item
```bash
PATCH /api/v1/menu/uuid
{
  "name": "Updated Name",
  "price": 10.00,
  "isAvailable": false
}
```

### Orders API (`/api/v1/orders`)

#### POST `/api/v1/orders` - Create new order
```bash
POST /api/v1/orders
{
  "customerName": "John Doe",
  "customerPhone": "+60123456789",
  "customerEmail": "john@example.com",
  "orderType": "pickup",
  "deliveryAddress": "123 Street, City",  # required for delivery
  "remarks": "Less ice, please",
  "items": [
    {
      "menuItemId": "uuid",
      "quantity": 2,
      "notes": "Extra hot"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "customerName": "John Doe",
    "customerPhone": "+60123456789",
    "customerEmail": "john@example.com",
    "totalAmount": 17.00,
    "orderType": "pickup",
    "deliveryAddress": null,
    "remarks": "Less ice, please",
    "statusId": "uuid",
    "status": "received",
    "statusLabel": "Order Received",
    "orderItems": [
      {
        "id": "uuid",
        "menuItemId": "uuid",
        "menuItemName": "Classic Milk Tea",
        "quantity": 2,
        "unitPrice": 8.50,
        "subtotal": 17.00,
        "notes": "Extra hot"
      }
    ],
    "createdAt": "2026-07-06T10:30:00Z",
    "updatedAt": "2026-07-06T10:30:00Z"
  }
}
```

#### GET `/api/v1/orders` - List orders
```bash
# Query params
?active=true              # Active orders (can transition)
?active=false             # Past orders (completed)
?search=<term>            # Search customer name/phone
```

#### GET `/api/v1/orders/:id` - Get order details
```bash
GET /api/v1/orders/uuid
```

#### PATCH `/api/v1/orders/:id/status` - Update order status
```bash
PATCH /api/v1/orders/uuid
{
  "status": "preparing"
}
```

**Status Flow:** `received → preparing → ready → completed`

**Error Response (Invalid Transition):**
```json
{
  "statusCode": 409,
  "message": "Invalid status transition from 'completed' to 'preparing'"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request (validation error) |
| 404  | Not Found |
| 409  | Conflict (invalid status transition) |
| 500  | Internal Server Error |

## Running Tests

```bash
npm test
npm run test:cov
```

## Tech Stack

- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Message Queue:** RabbitMQ
- **Validation:** class-validator
