# 🍔 Food Ordering Platform

A full-stack food ordering platform built using **React, FastAPI, PostgreSQL, and Docker**.

The application allows users to browse restaurants, view menus, add food items to a cart, update quantities, place orders, view order history, and update order status.

It also includes **Dark Mode / Light Mode** and is containerized using Docker.

---

## 🚀 Features

### 👤 Restaurant Browsing
- View available restaurants
- View restaurant description and location
- Select a restaurant to view its menu

### 🍕 Menu
- View menu items for each restaurant
- Display item name, description, and price
- Add food items to cart

### 🛒 Shopping Cart
- Create a cart
- Add items to cart
- Increase/decrease item quantity
- Remove items from cart
- Calculate cart total

### 💳 Checkout
- Checkout the current cart
- Create an order
- Calculate total order amount
- Display order confirmation

### 📦 Orders
- View individual order details
- View order history
- Display ordered items
- Display quantity and price
- Display total amount

### 🔄 Order Status
Orders support:
- Placed
- Confirmed
- Preparing
- Out for Delivery
- Delivered

### 🌗 Dark / Light Mode
The frontend supports:
- Light Mode
- Dark Mode

---

## 🏗️ Architecture

```text
                         ┌───────────────┐
                         │     User      │
                         └───────┬───────┘
                                 │
                                 ▼
                    ┌─────────────────────┐
                    │ React + Vite        │
                    │ Frontend            │
                    │ Port: 5173          │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │ FastAPI             │
                    │ Backend             │
                    │ Port: 8000          │
                    └──────────┬──────────┘
                               │
                               │ SQLAlchemy
                               ▼
                    ┌─────────────────────┐
                    │ PostgreSQL 17       │
                    │ Database            │
                    └─────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- React
- Vite
- JavaScript
- CSS
- Nginx

### Backend
- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- Pydantic

### Database
- PostgreSQL 17

### Containerization
- Docker
- Docker Compose

### Version Control
- Git
- GitHub

---

## 📁 Project Structure

```text
food-ordering-platform/
│
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── seed.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── ...
│   │
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🔌 API Endpoints

### Restaurants

```http
GET /restaurants/
POST /restaurants/
```

### Menu

```http
POST /menu-items/
GET /restaurants/{restaurant_id}/menu-items/
```

### Cart

```http
POST /carts/
POST /carts/{cart_id}/items/
GET /carts/{cart_id}
PUT /carts/{cart_id}/items/{cart_item_id}
DELETE /carts/{cart_id}/items/{cart_item_id}
```

### Orders

```http
POST /carts/{cart_id}/checkout/
GET /orders/{order_id}
GET /orders/
PUT /orders/{order_id}/status
```

---

## 🐳 Running with Docker

### Prerequisites

Install:
- Docker
- Docker Compose
- Git

### Clone the repository

```bash
git clone https://github.com/shreerajahm/food-ordering-platform.git
cd food-ordering-platform
```

### Start the application

```bash
docker compose up -d
```

Check the containers:

```bash
docker compose ps
```

Expected services:

```text
food-ordering-postgres
food-ordering-backend
food-ordering-frontend
```

---

## 🌐 Application URLs

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:8000
```

FastAPI Swagger documentation:

```text
http://localhost:8000/docs
```

---

## 🌱 Seed Database

Populate the database with sample restaurants and menu items:

```bash
docker compose exec backend python seed.py
```

Expected output:

```text
Database seed completed successfully.
```

---

## 🧪 Testing the Backend

```bash
curl http://localhost:8000/restaurants/
```

```bash
curl http://localhost:8000/restaurants/1/menu-items/
```

```bash
curl -X POST http://localhost:8000/carts/
```

```bash
curl -X POST http://localhost:8000/carts/1/checkout/
```

```bash
curl http://localhost:8000/orders/1
```

---

## 🔄 Application Flow

```text
User
 │
 ▼
View Restaurants
 │
 ▼
Select Restaurant
 │
 ▼
View Menu
 │
 ▼
Add Food Items
 │
 ▼
Shopping Cart
 │
 ├── Increase Quantity
 ├── Decrease Quantity
 └── Remove Item
 │
 ▼
Checkout
 │
 ▼
Order Created
 │
 ▼
Order Confirmation
 │
 ▼
Order History
 │
 ▼
Update Order Status
```

---

## 🗄️ Database Models

```text
Restaurant
    │
    └── MenuItem

Cart
    │
    └── CartItem
            │
            └── MenuItem

Order
    │
    └── OrderItem
            │
            └── MenuItem
```

### Restaurant
Stores name, description, location, image URL, and active status.

### MenuItem
Stores restaurant ID, item name, description, price, image URL, and availability.

### Cart
Represents a customer's shopping cart.

### CartItem
Stores cart ID, menu item ID, and quantity.

### Order
Stores cart ID, total amount, order status, and creation timestamp.

### OrderItem
Stores order ID, menu item ID, quantity, and price.

---

## 🔐 CORS

The FastAPI backend is configured to allow requests from the frontend application.

```text
http://localhost:5173
```

---

## 🐘 PostgreSQL

PostgreSQL runs as a Docker container.

```text
PostgreSQL 17
```

The backend connects to PostgreSQL through SQLAlchemy.

---

## 🐳 Docker Services

```text
┌─────────────────────────────────┐
│         Docker Compose          │
│                                 │
│  ┌─────────────┐                │
│  │ PostgreSQL  │                │
│  │ Port: 5432  │                │
│  └──────┬──────┘                │
│         │                       │
│  ┌──────▼──────┐                │
│  │  FastAPI    │                │
│  │  Port: 8000 │                │
│  └──────┬──────┘                │
│         │                       │
│  ┌──────▼──────┐                │
│  │   React     │                │
│  │   Nginx     │                │
│  │  Port: 5173 │                │
│  └─────────────┘                │
└─────────────────────────────────┘
```

---

## 🛑 Stop the Application

```bash
docker compose down
```

To stop and remove volumes:

```bash
docker compose down -v
```

> `docker compose down -v` removes the PostgreSQL volume and therefore deletes local database data.

---

## 🔍 Useful Docker Commands

```bash
docker compose ps
docker compose logs backend
docker compose logs frontend
docker compose logs postgres
docker compose restart backend
docker compose restart frontend
```

---

## 🔧 Development

### Backend

```bash
cd backend
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📈 Future Improvements

- User registration and authentication
- JWT-based authentication
- Customer profiles
- Restaurant owner accounts
- Admin dashboard
- Payment gateway integration
- Food image upload
- Restaurant search and filtering
- Food categories
- Delivery address management
- Order tracking
- Email/SMS notifications
- Redis caching
- Automated testing
- CI/CD pipeline
- Cloud deployment
- HTTPS and custom domain
- Load balancing
- Monitoring and logging

---

## ☁️ Future Cloud Architecture

```text
                         Internet
                            │
                            ▼
                     Custom Domain
                            │
                            ▼
                    Load Balancer
                            │
                 ┌──────────┴──────────┐
                 │                     │
                 ▼                     ▼
           Frontend Containers    Backend Containers
                                       │
                                       ▼
                                  PostgreSQL
                                       │
                                       ▼
                                  Object Storage
                                  Food Images
```

Infrastructure can be automated using Terraform and application deployment can be automated using CI/CD.

---

## 👨‍💻 Author

**Shreeraja**

GitHub: https://github.com/shreerajahm

---

## 📄 License

This project is created for learning and development purposes.
