# F&B Ordering System
A scalable REST API for food & beverage ordering built with NestJS, TypeScript, PostgreSQL, TypeORM, and RabbitMQ.

# Assestment

1. API contract decisions: What was one non-obvious design decision you made in the API surface — a naming choice, a response shape, a status code — and why did you make it?
-	Path versioning e.g. (GET /v1/menu)
-	Standard status code for conflict during update status is response code 409 from HTTP spec. Ref (https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/409 )
- Use BigDecimal (big.js) in price calculation and adding

2. Versioning: If a mobile client were already consuming GET /menu and you needed to change the response shape in a breaking way, how would you handle that? 
-	Production is using versioning of GET /v1/menu. Branch out and make changes in v2 folder and create another GET/v2/menu. We will just need to deployed the latest version to production after SIT and UAT.

3. What you'd do differently with more time: Name one thing you would change or add if you had another two hours. Be specific. 
-	If there is another two hours, I would like to improve the order processing by introducing Redis alongside RabbitMq. Redis can solve different problem like accidentally submitted same order for multiple times due to network retries or repeated button taps. Redis has distributed lock that can prevent multiple same order event. Redis Zset to schedule for expiration logic. Redis processing speed is faster for frequently accessed reference data. RabbitMq is more towards asynchronous workflow.

4. Production gap: What is the most significant thing missing from this service that would concern you before shipping it to real users?
-	Duplicate orders from same customer
-	Data consistency/asynchronous. E.g. 2 orders for last item at same time. Redis and DB with quantity mismatch.
-	Failure recovery. System crashes. 

## Prerequisites
- Node.js (v18+)
- PostgreSQL (v15+)
- RabbitMQ (v3.12+)

## Installation
```bash
npm install
```
## Database Setup
### 1. Install PostgreSQL
# Windows: Download from https://www.postgresql.org/download/windows/

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
npm run seed:coffee
```

## RabbitMQ Setup
### 1. Install RabbitMQ
```bash
# Windows: Download from https://www.rabbitmq.com/download.html
```

### 2. Start RabbitMQ Service
```bash
# Windows: Start RabbitMQ service from Services
```
### 3. Enable Management Plugin (Optional)
```bash
rabbitmq-plugins enable rabbitmq_management
```

### 4. Configure Environment
Edit `.env` file:
```env
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
```

## Program Startup
## 1. Seed Data
```bash
npm run seed:coffee 
```
## 2. Run Application
```bash
npm run start
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
#### GET `/api/v1/menu/items/:id` - Get specific menu item
```bash
GET /api/v1/menu/items/uuid
```
#### PATCH `/api/v1/menu/items/:id` - Update menu item
```bash
PATCH /api/v1/menu/items/uuid
{
  "name": "Updated Name",
  "price": "10.00",
  "stockCount": 20,
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
PATCH /api/v1/orders/uuid/status
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