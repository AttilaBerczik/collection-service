# Spar Collection System

A Next.js application for grocery collection and delivery service with PostgreSQL database integration.

## Features

- **Customer Dashboard**: Create shopping lists with product selection
- **Employee Dashboard**: View assigned lists, mark items as collected/unavailable
- **Real-time Database**: PostgreSQL integration with Azure Flexible Servers
- **Offline Support**: Online/offline status indicators
- **Role-based Access**: Separate views for customers and employees

## Database Setup

### 1. Environment Configuration

Update `.env.local` with your Azure PostgreSQL credentials:

```env
# Azure PostgreSQL Configuration
DATABASE_URL="postgresql://username:password@your-server-name.postgres.database.azure.com:5432/your-database-name?sslmode=require"

# Alternative individual settings
DB_HOST=your-server-name.postgres.database.azure.com
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=username
DB_PASSWORD=password
DB_SSL=true
```

### 2. Database Schema

The application automatically creates the following tables:
- `users` - Customer and employee accounts
- `products` - Spar product catalog
- `shopping_lists` - Customer shopping lists
- `shopping_list_items` - Items within each shopping list

### 3. Sample Data

The system automatically seeds with:
- 3 default users (2 customers, 1 employee)
- 10 Spar products with images and prices

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure your Azure PostgreSQL credentials in `.env.local`

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Usage

### First Login
- The database will be automatically initialized on first login
- Choose "Customer" or "Employee" role
- No password required for MVP

### Customer Features
- Browse Spar product catalog
- Add items to cart with quantities
- Create shopping lists
- View order status (pending/in_progress/completed)

### Employee Features
- View assigned shopping lists
- Mark items as collected or unavailable
- Complete lists to send to payment system
- Real-time status updates

## API Endpoints

- `POST /api/setup` - Initialize database and seed data
- `GET /api/products` - Get all products
- `GET /api/users` - Get users by role
- `GET /api/shopping-lists` - Get shopping lists (by customer/employee)
- `POST /api/shopping-lists` - Create new shopping list
- `PATCH /api/shopping-lists/[id]` - Update list/item status

## Database Structure

### Tables
- **users**: id, name, role, created_at
- **products**: id, name, image, price, created_at
- **shopping_lists**: id, customer_id, customer_name, status, assigned_employee_id, created_at, updated_at
- **shopping_list_items**: id, shopping_list_id, product_id, quantity, status, created_at, updated_at

### Relationships
- Users → Shopping Lists (customer)
- Users → Shopping Lists (assigned employee)
- Products → Shopping List Items
- Shopping Lists → Shopping List Items (cascade delete)

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Azure Flexible Servers)
- **ORM**: Native pg (node-postgres) driver
