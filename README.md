# Digital Coupon Marketplace

Backend exercise solution for a digital marketplace that sells coupon-based products through two channels:

- direct customers via a minimal frontend
- external resellers via a Bearer-token REST API

The project is focused on backend design, business-rule enforcement, API quality, and a Dockerized local setup.

## Tech Stack

- **Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose
- **Frontend:** React, TypeScript, Vite
- **Infra:** Docker, Docker Compose

## What this solution covers

- Admin CRUD for coupon products
- Customer flow with fixed purchase price (`minimum_sell_price`)
- Reseller API with Bearer authentication
- Strict server-side pricing enforcement
- MongoDB persistence
- Dockerized local environment
- Layered backend structure (`controllers / services / repositories`)

## Domain Model

### Product

Fields implemented:

- `id` (UUID)
- `name`
- `description`
- `type`
- `image_url`
- `created_at`
- `updated_at`

### Coupon

Additional coupon fields:

- `cost_price`
- `margin_percentage`
- `minimum_sell_price` (derived on the server)
- `is_sold`
- `value_type`
- `value`

## Pricing Rule

The backend calculates `minimum_sell_price` on the server only:

```text
minimum_sell_price = cost_price * (1 + margin_percentage / 100)
```

## Validation Rules Enforced Server-Side

- `cost_price >= 0`
- `margin_percentage >= 0`
- `reseller_price >= minimum_sell_price`
- `minimum_sell_price` is never accepted from client input
- `image_url` must be a valid `http/https` URL
- `value_type` must be `STRING` or `IMAGE`

## Authentication

The assignment explicitly requires Bearer-token authentication for reseller endpoints.

In this solution, role separation is preserved as follows:

- **Admin API** requires `ADMIN_TOKEN`
- **Reseller API** requires `RESELLER_TOKEN`
- **Customer flow** is public

A full login system is intentionally **not** implemented, because it was not required by the exercise.

Instead, this project uses **pre-shared demo Bearer tokens** configured in the environment.

## Important: How the Tokens Work

### Admin Token

The admin flow is protected so that only admin users can create, update or delete products.

The backend checks:

```http
Authorization: Bearer <ADMIN_TOKEN>
```

Example demo value:

```env
ADMIN_TOKEN=admin-demo-token
```

### Reseller Token

The reseller flow is protected exactly as required by the assignment.

The backend checks:

```http
Authorization: Bearer <RESELLER_TOKEN>
```

Example demo value:

```env
RESELLER_TOKEN=reseller-demo-token
```

### Why There Is No Login Page

This exercise does not require user accounts, sessions, or token issuing.

So instead of implementing a full authentication system, the project uses **static demo tokens from environment variables**.

This keeps the role separation clear while keeping the exercise focused on backend design and business logic.

### How to Use the Tokens in the Frontend

- Open the **Admin** page and paste the demo admin token once
- Open the **Reseller** page and paste the demo reseller token once
- The token is stored in browser `localStorage` for convenience during the demo
- The token is **not embedded in the frontend bundle**

Example header:

```http
Authorization: Bearer admin-demo-token
```

or

```http
Authorization: Bearer reseller-demo-token
```

## Demo Tokens

Example local tokens for review:

```env
ADMIN_TOKEN=admin-demo-token
RESELLER_TOKEN=reseller-demo-token
```

## API Overview

### Reseller API

Base path: `/api/v1`

Endpoints:

- `GET /products`
- `GET /products/:productId`
- `POST /products/:productId/purchase`

Example purchase request:

```bash
curl -X POST http://localhost:3000/api/v1/products/<productId>/purchase \
  -H "Authorization: Bearer reseller-demo-token" \
  -H "Content-Type: application/json" \
  -d '{
    "reseller_price": 120
  }'
```

Success response:

```json
{
  "product_id": "uuid",
  "final_price": 120,
  "value_type": "STRING",
  "value": "ABCD-1234"
}
```

### Customer API

Base path: `/customer`

Endpoints:

- `GET /products`
- `POST /products/:productId/purchase`

### Admin API

Base path: `/admin`

Endpoints:

- `GET /products`
- `GET /products/:productId`
- `POST /products`
- `PATCH /products/:productId`
- `DELETE /products/:productId`

Example admin create request:

```bash
curl -X POST http://localhost:3000/admin/products \
  -H "Authorization: Bearer admin-demo-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Amazon 100",
    "description": "Gift card",
    "image_url": "https://example.com/a.png",
    "cost_price": 80,
    "margin_percentage": 25,
    "value_type": "STRING",
    "value": "ABCD-1234"
  }'
```

## Error Format

All API errors follow the required format:

```json
{
  "error_code": "ERROR_NAME",
  "message": "Human readable message"
}
```

Examples:

- `PRODUCT_NOT_FOUND` → `404`
- `PRODUCT_ALREADY_SOLD` → `409`
- `RESELLER_PRICE_TOO_LOW` → `400`
- `UNAUTHORIZED` → `401`
- `BAD_REQUEST` → `400`

## Project Structure

```text
backend/
  src/
    controllers/
    db/
    middlewares/
    models/
    repositories/
    routes/
    services/
    utils/
frontend/
docker-compose.yml
README.md
```

## Running Locally with Docker

### 1. Create a root `.env`

Example:

```env
ADMIN_TOKEN=admin-demo-token
RESELLER_TOKEN=reseller-demo-token
VITE_API_BASE=http://localhost:3000
```

### 2. Start the project

```bash
docker compose up --build
```

## App URLs

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`
- Health check: `http://localhost:3000/health`

## Running Without Docker

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Design Notes

- A single coupon collection is used for this exercise, while preserving the `type` field and service boundaries so additional product types can be added later
- Coupon values are returned only after a successful purchase
- Public product responses do not expose `cost_price` or `margin_percentage`
- `markSoldIfAvailable` prevents double-sell by updating only when `is_sold = false`
- Sold products are intentionally immutable from the admin side
- Admin and reseller roles are separated using distinct Bearer tokens

## Known Limitation

The sell flow prevents duplicate sale of the same coupon, but the reseller validation and the sell update are not wrapped in a database transaction.

For this exercise, the important invariant of “do not sell the same coupon twice” is preserved, but a production version could move the full pricing-and-sell flow into a transaction or a stricter atomic database operation.

## Submission Hygiene

Before uploading:

- do **not** include `.env`
- do **not** include `node_modules`
- do **not** include `dist`
- do **not** include `.git` inside a zip export
- share the GitHub repository link rather than a generated source zip when possible