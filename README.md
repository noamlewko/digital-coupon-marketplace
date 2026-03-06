# Digital Coupon Marketplace

Backend exercise solution for a digital coupon marketplace with:

- Admin product management
- Direct customer purchase flow
- External reseller REST API with Bearer token authentication
- Minimal frontend
- Dockerized setup
- MongoDB persistence

## Tech Stack

- Backend: Node.js, Express, TypeScript, MongoDB, Mongoose
- Frontend: React, TypeScript, Vite
- Infrastructure: Docker, Docker Compose

## Features

### Product Model

The current implementation supports the `COUPON` product type.

To keep the exercise focused, the database model is implemented for coupons only, while still keeping a `type` field and a layered backend structure (`controllers/services/repositories`) so additional product types can be introduced later with minimal API changes.

### Admin API
- Create product
- View all products
- View product by id
- Update product
- Delete product

### Customer Flow
- View available coupons
- Purchase at fixed `minimum_sell_price`

### Reseller API
- `GET /api/v1/products`
- `GET /api/v1/products/:productId`
- `POST /api/v1/products/:productId/purchase`
- Bearer token authentication
- Enforces `reseller_price >= minimum_sell_price`

## Pricing Rule

`minimum_sell_price = cost_price * (1 + margin_percentage / 100)`

The value is always calculated server-side.

## Running with Docker

```bash
docker compose up --build
```

### App URLs
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

## Demo Tokens

- Admin token: `admin-demo-token`
- Reseller token: `reseller-demo-token`

## Example Admin Create Request

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

## Project Structure

```text
backend/
frontend/
docker-compose.yml
README.md
```

## Notes

- `minimum_sell_price` is never accepted from client input
- public product endpoints do not expose `cost_price` or `margin_percentage`
- coupon value is returned only after successful purchase
- no real secrets should be committed