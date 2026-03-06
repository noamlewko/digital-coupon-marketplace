# Digital Coupon Marketplace

Backend exercise solution for a digital marketplace that sells coupon-based products through two channels:

- direct customers via a minimal frontend
- external resellers via a Bearer-token REST API

The project focuses on backend design, business-rule enforcement, API quality, and a Dockerized local setup.

## Tech Stack

- **Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose
- **Frontend:** React, TypeScript, Vite
- **Infra:** Docker, Docker Compose

## Features

- Admin CRUD for coupon products
- Customer purchase flow with fixed price
- Reseller API with Bearer-token authentication
- Server-side pricing enforcement
- MongoDB persistence
- Dockerized local setup

## Running with Docker

### 1. Create a root `.env`

    ADMIN_TOKEN=admin-demo-token
    RESELLER_TOKEN=reseller-demo-token
    VITE_API_BASE=http://localhost:3000

### 2. Start the project

    docker compose up --build

## App URLs

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`
- Health check: `http://localhost:3000/health`

## Authentication

This solution uses **pre-shared demo Bearer tokens** configured through environment variables.

- **Admin API** requires `ADMIN_TOKEN`
- **Reseller API** requires `RESELLER_TOKEN`
- **Customer flow** is public

In the frontend demo, the admin and reseller tokens are entered once and stored in browser `localStorage` for convenience.

Demo values:

    ADMIN_TOKEN=admin-demo-token
    RESELLER_TOKEN=reseller-demo-token

## Main Endpoints

- **Admin:** `/admin/products`
- **Customer:** `/customer/products`
- **Reseller:** `/api/v1/products`

## Pricing Rule

`minimum_sell_price` is always calculated server-side:

    minimum_sell_price = cost_price * (1 + margin_percentage / 100)

This prevents clients from overriding pricing rules.

## Purchase Consistency

Purchases are implemented using conditional single-document update operations in MongoDB.

This ensures that:

- the same coupon cannot be sold twice
- reseller purchases only succeed when `reseller_price >= minimum_sell_price` at the moment of purchase
- purchase behavior is atomic at the product level for this exercise

## Design Notes

- The current implementation focuses on the `COUPON` product type, as required by the exercise.
- The explicit `type` field and service boundaries were kept so additional product types can be added later with minimal structural changes.
- Coupon values are returned only after a successful purchase.
- Public product responses do not expose `cost_price` or `margin_percentage`.
- Admin and reseller roles are separated using distinct Bearer tokens.