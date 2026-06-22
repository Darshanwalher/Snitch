# SNITCH — Modern Streetwear E-Commerce Platform

> A full-stack marketplace where streetwear brands list, manage, and sell products directly to buyers — complete with real-time payments, transactional emails, and role-based seller dashboards.

---

## Overview

Snitch is a production-deployed, multi-vendor e-commerce platform purpose-built for the streetwear niche. Sellers manage product catalogs with variant-level control (size, color, stock, per-variant pricing and imagery), while buyers browse, search with advanced filters, add to cart, and checkout via Razorpay. The system handles the full commerce lifecycle — from registration and Google OAuth sign-in through payment verification with atomic stock deduction and branded transactional email dispatch to both buyers and sellers.

**Live deployment:** [snitch-nvsg.onrender.com](https://snitch-nvsg.onrender.com)

---

## Key Features

### Authentication & Security
- **JWT cookie-based authentication** with 7-day token expiry, keeping sessions persistent across browser tabs without exposing tokens to JavaScript
- **Google OAuth 2.0 sign-in** via Passport.js, enabling frictionless one-click registration and login
- **OTP-based password reset** with time-limited (10-minute) codes auto-expiring via MongoDB TTL indexes, preventing replay attacks
- **Role-based access control** with separate `buyer` and `seller` roles enforced at the middleware layer — sellers access product management endpoints, buyers access cart and checkout
- **Request validation layer** using `express-validator` on all mutation endpoints, catching malformed input before it reaches business logic
- **API Rate Limiting** via `express-rate-limit` — strict limits (15 attempts/15 mins) on authentication endpoints to prevent brute-force attacks, and general limits (100 requests/15 mins) globally across all API routes to protect system resources

### Product Management (Seller)
- **Multi-image product listings** with images uploaded to ImageKit CDN via buffer streaming (no disk I/O), supporting up to 7 images per product
- **Product variant system** allowing sellers to define size/color/attribute variants, each with independent pricing, stock levels, and image sets
- **Full CRUD operations** — create, update, and delete products and individual variants through protected seller-only endpoints
- **Seller dashboard** providing a centralized view of all listed products with direct management controls

### Shopping & Checkout (Buyer)
- **Advanced product search** with multi-filter support: text query (title, description, variant attributes), price range, size, color, and sort options (price ascending/descending, newest)
- **Cart with stock-awareness** — quantity adjustments are validated against real-time inventory, preventing overselling with clear user feedback
- **Buy Now + Cart checkout** — two purchase flows: instant single-item purchase or standard cart-based checkout, both routing through the same payment pipeline
- **Razorpay payment integration** with server-side order creation, client-side checkout widget, and cryptographic signature verification on the backend
- **Server-Side Pagination** on product listings and search results returning structured metadata (`currentPage`, `totalPages`, `totalProducts`, `limit`) to minimize initial load times and network overhead

### Order Processing & Notifications
- **Atomic stock deduction with rollback** — on payment verification, stock is decremented per-variant with a compensating transaction pattern; if any item is out of stock, all prior deductions are reversed
- **Branded HTML transactional emails** sent via Gmail REST API (OAuth2, no SMTP dependency) — welcome emails on registration, OTP emails for password reset, order confirmations to buyers, and per-seller order notifications with itemized breakdowns
- **Development email fallback** — when OAuth credentials are absent, emails log to console instead of failing silently, enabling offline development

### Frontend
- **React 19 SPA** with React Router v7 for client-side routing and protected route guards
- **Redux Toolkit** for centralized state management across auth, product, and cart domains
- **Feature-based architecture** with isolated modules (auth, products, cart, shared) each containing pages, hooks, services, and state slices
- **Responsive UI** built with Tailwind CSS v4, using premium typography (Bebas Neue + DM Sans) for a streetwear brand aesthetic

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 | Component-based UI with hooks |
| **Frontend** | React Router v7 | Client-side routing with protected routes |
| **Frontend** | Redux Toolkit | Centralized state management |
| **Frontend** | Tailwind CSS v4 | Utility-first responsive styling |
| **Frontend** | Axios | HTTP client with cookie credential |
| **Backend** | Vite 8 | Dev server with HMR and API proxy |
| **Backend** | Express 5 | REST API framework |
| **Backend** | Passport.js | Google OAuth 2.0 strategy |
| **Backend** | JSON Web Tokens | Stateless session authentication |
| **Backend** | express-validator | Request input validation |
| **Backend** | Multer | Multipart form-data / image upload parsing |
| **Backend** | bcrypt | Password hashing (10 salt rounds) |
| **Backend** | express-rate-limit | Brute-force and API abuse protection |
| **Database** | MongoDB Atlas | Cloud-hosted document database |
| **Database** | Mongoose 9 | ODM with schema validation and aggregation pipelines |
| **Payments** | Razorpay | Order creation, payment capture, signature verification |
| **Storage** | ImageKit | CDN-backed image storage and optimization |
| **Email** | Gmail REST API | Transactional email dispatch via OAuth2 |
| **DevOps** | Render | Full-stack cloud deployment (static frontend served from Express) |
| **Logging** | Morgan | HTTP request logging in development |
| **Testing** | Jest | Test runner and expectation framework |
| **Testing** | Supertest | HTTP integration test library |
| **Testing** | mongodb-memory-server | In-memory isolated database instance |
| **CI/CD** | GitHub Actions | Automated testing and verification workflow |

---

## Data Model

| Collection | Key Fields | Relationships |
|------------|-----------|---------------|
| **User** | `email` (unique), `password` (bcrypt), `fullname`, `contact`, `role` (buyer \| seller), `googleId` | → owns 1 Cart, → sells many Products, → has many Payments |
| **Product** | `title`, `description`, `price` {amount, currency}, `images[]`, `variants[]`, `timestamps` | → belongs to 1 User (seller), → contains many Variants (embedded) |
| **Variant** | `images[]`, `stock`, `attributes` {color, size, ...}, `price` {amount, currency} | Embedded inside Product |
| **Cart** | `user` (ref → User), `items[]` | → belongs to 1 User, → items reference Product + Variant |
| **Cart Item** | `product` (ref), `variant` (ref), `quantity`, `price` {amount, currency} | Embedded inside Cart |
| **Payment** | `status` (pending \| paid \| failed), `isBuyNow`, `razorpay` {orderId, paymentId, signature}, `price`, `orderItems[]` | → belongs to 1 User, → contains Order Item snapshots |
| **Order Item** | `title`, `productId`, `variantId`, `quantity`, `images[]`, `description`, `price` | Embedded inside Payment (immutable snapshot) |
| **OTP** | `email` (unique), `otp`, `createdAt` (TTL: 600s auto-delete) | → linked to User by email |

**Design decisions:**
- **Embedding vs. referencing** — Variants are embedded inside Products (always accessed together), while Cart items reference Products by ObjectId (queried separately via aggregation pipelines).
- **Order snapshots** — Payment records store a full copy of ordered items at purchase time, so product edits or deletions never corrupt historical order data.
- **Reusable `priceSchema`** — A shared subdocument `{amount, currency}` is used across Products, Variants, Cart Items, and Payments for consistent multi-currency pricing.
- **TTL auto-expiry** — OTP documents are auto-deleted by MongoDB after 10 minutes without any application-level cron or cleanup.

---

## System Architecture

```
                              ┌──────────────────────┐
                              │   Google OAuth 2.0    │
                              │     Provider          │
                              └──────────┬───────────┘
                                         │ OAuth flow
                                         ▼
┌─────────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│                     │       │                      │       │                      │
│   React 19 SPA      │       │   Passport.js        │       │   Gmail REST API     │
│   (Vite + Tailwind) │       │   (Google Strategy)  │       │   (Transactional     │
│                     │       │                      │       │    Email via OAuth2)  │
│  ┌───────────────┐  │       └──────────┬───────────┘       └──────────▲───────────┘
│  │ Redux Toolkit  │ │                  │                              │
│  │ (auth, product,│ │                  │                              │
│  │  cart slices)  │ │                  │                              │
│  └───────────────┘  │                  │                              │
│                     │  REST API calls  │                              │
│  ┌───────────────┐  │  (JWT cookie)    │                              │
│  │ React Router  │  │ ───────────────► │                              │
│  │ v7 (Protected │  │                  │                              │
│  │  Routes)      │  │                  ▼                              │
│  └───────────────┘  │       ┌──────────────────────┐                  │
│                     │       │                      │    OAuth2 token  │
│  ┌───────────────┐  │       │   Express 5 API      │ ─────────────────┘
│  │ Axios         │  │       │   Server             │
│  │ (credentials) │  │       │                      │    Buffer upload
│  └───────────────┘  │       │  ┌────────────────┐  │ ──────────────────┐
│                     │       │  │ Controllers     │  │                  │
└─────────┬───────────┘       │  │ DAO Layer       │  │                  ▼
          │                   │  │ Services        │  │       ┌──────────────────────┐
          │                   │  │ Middleware      │  │       │                      │
          │  Razorpay         │  │ Validators      │  │       │   ImageKit CDN       │
          │  Checkout         │  └────────┬───────┘  │       │   (Image Storage     │
          │  Widget           │           │          │       │    & Optimization)    │
          │                   │           │ Mongoose │       │                      │
          ▼                   │           │ ODM      │       └──────────────────────┘
┌─────────────────────┐       │           │          │
│                     │       └───────────┼──────────┘
│   Razorpay          │◄── Order create / │
│   Payment Gateway   │    Signature      │
│                     │    verify          ▼
│  - Order creation   │       ┌──────────────────────┐
│  - Payment capture  │       │                      │
│  - Signature verify │       │   MongoDB Atlas      │
│                     │       │   (Cloud Database)   │
└─────────────────────┘       │                      │
                              │  Collections:        │
                              │  users, products,    │
                              │  carts, payments,    │
                              │  otps                │
                              └──────────────────────┘
```

The architecture follows a **monolithic REST API** pattern with the React SPA served as static assets from the Express server in production. This eliminates CORS complexity and simplifies deployment to a single Render service. External services are cleanly abstracted behind dedicated service modules (`payment.service.js`, `storage.service.js`, `email.js`), making them independently swappable. The frontend communicates exclusively via REST endpoints with JWT tokens stored in HTTP cookies for secure, cross-tab session persistence.

---

## Application Flow — Checkout Journey

```
  BUYER                REACT SPA              EXPRESS API             RAZORPAY            MONGODB           GMAIL API
    │                     │                       │                     │                   │                  │
    │  Browse products    │                       │                     │                   │                  │
    │ ──────────────────► │  GET /api/products     │                     │                   │                  │
    │                     │ ─────────────────────► │                     │                   │                  │
    │                     │                       │  find all products  │                   │                  │
    │                     │                       │ ──────────────────────────────────────► │                  │
    │                     │                       │ ◄─────────────────────────────────────  │                  │
    │                     │ ◄──────────────────── │  products[]          │                   │                  │
    │  ◄───────────────── │                       │                     │                   │                  │
    │                     │                       │                     │                   │                  │
    │  Add to cart        │                       │                     │                   │                  │
    │ ──────────────────► │  POST /api/cart/add    │                     │                   │                  │
    │                     │ ─────────────────────► │                     │                   │                  │
    │                     │                       │  1. Validate stock  │                   │                  │
    │                     │                       │ ──────────────────────────────────────► │                  │
    │                     │                       │ ◄─────────────────────────────────────  │                  │
    │                     │                       │  2. Upsert cart     │                   │                  │
    │                     │                       │ ──────────────────────────────────────► │                  │
    │                     │ ◄──────────────────── │  Cart updated        │                   │                  │
    │  ◄───────────────── │                       │                     │                   │                  │
    │                     │                       │                     │                   │                  │
    │  Checkout           │                       │                     │                   │                  │
    │ ──────────────────► │  POST /payment/create  │                     │                   │                  │
    │                     │ ─────────────────────► │                     │                   │                  │
    │                     │                       │  3. Aggregate cart  │                   │                  │
    │                     │                       │ ──────────────────────────────────────► │                  │
    │                     │                       │  4. Create order    │                   │                  │
    │                     │                       │ ──────────────────► │                   │                  │
    │                     │                       │ ◄───────────────── │  order_id           │                  │
    │                     │                       │  5. Save payment   │                   │                  │
    │                     │                       │    (status:pending) │                   │                  │
    │                     │                       │ ──────────────────────────────────────► │                  │
    │                     │ ◄──────────────────── │  Order details      │                   │                  │
    │                     │                       │                     │                   │                  │
    │                     │  Open Razorpay widget  │                     │                   │                  │
    │                     │ ─────────────────────────────────────────► │                   │                  │
    │  Complete payment   │                       │                     │                   │                  │
    │ ──────────────────────────────────────────────────────────────► │                   │                  │
    │                     │ ◄──────────────────────────────────────── │                   │                  │
    │                     │  payment_id + signature │                     │                   │                  │
    │                     │                       │                     │                   │                  │
    │                     │  POST /payment/verify   │                     │                   │                  │
    │                     │ ─────────────────────► │                     │                   │                  │
    │                     │                       │  6. Verify signature │                   │                  │
    │                     │                       │  7. Atomic stock    │                   │                  │
    │                     │                       │     deduction       │                   │                  │
    │                     │                       │     (with rollback) │                   │                  │
    │                     │                       │ ──────────────────────────────────────► │                  │
    │                     │                       │  8. Payment→"paid"  │                   │                  │
    │                     │                       │ ──────────────────────────────────────► │                  │
    │                     │                       │  9. Clear cart      │                   │                  │
    │                     │                       │ ──────────────────────────────────────► │                  │
    │                     │                       │ 10. Order confirm   │                   │                  │
    │                     │                       │ ─────────────────────────────────────────────────────────► │
    │                     │                       │ 11. Seller notify   │                   │                  │
    │                     │                       │ ─────────────────────────────────────────────────────────► │
    │                     │ ◄──────────────────── │  Payment verified    │                   │                  │
    │  Order success page │                       │                     │                   │                  │
    │ ◄───────────────── │                       │                     │                   │                  │
```

**Step-by-step breakdown:**
1. **Stock validation** — Cart operations check variant-level inventory in real-time before allowing additions or quantity changes.
2. **Cart upsert** — If the item already exists in the cart, the quantity is incremented; otherwise a new cart item is created.
3. **Cart aggregation** — MongoDB aggregation pipeline joins cart items with products and their matching variants to compute the total price.
4. **Razorpay order** — A server-side order is created with the computed amount; the frontend opens the Razorpay checkout widget.
5. **Payment record** — A pending payment document is created with all order item snapshots before the user pays.
6. **Signature verification** — The Razorpay signature is cryptographically verified server-side to prevent tampering.
7. **Atomic stock deduction** — Stock is decremented per-variant with a compensating rollback if any item has insufficient inventory.
8. **Status update** — Payment status transitions from `pending` → `paid` with Razorpay IDs stored.
9. **Cart cleanup** — The buyer's cart is cleared after successful payment.
10. **Buyer email** — Branded HTML order confirmation sent via Gmail REST API with itemized order details.
11. **Seller emails** — Each seller with items in the order receives a separate notification email with their specific items and earnings.

---

## Backend Request Lifecycle

```
  ┌─────────────────────────────────────────────────────────────────┐
  │                    Incoming HTTP Request                        │
  └──────────────────────────┬──────────────────────────────────────┘
                             ▼
                   ┌─────────────────┐
                   │  Morgan Logger  │  ← Logs method, URL, status, time
                   └────────┬────────┘
                            ▼
                   ┌─────────────────┐
                   │  Body Parsers   │  ← express.json + urlencoded + cookieParser
                   └────────┬────────┘
                            ▼
                   ┌─────────────────┐
                   │ CORS Middleware  │  ← Whitelist origin, credentials, methods
                   └────────┬────────┘
                            ▼
                ┌───────────────────────┐
                │    Route Matching     │
                │ /auth  /products /cart │
                └───┬───────┬───────┬───┘
                    │       │       │
          ┌─────────┘       │       └──────────┐
          ▼                 ▼                   ▼
    ┌──────────┐    ┌──────────────┐    ┌──────────────┐
    │  Public  │    │Authenticated │    │ Seller Only  │
    └────┬─────┘    └──────┬───────┘    └──────┬───────┘
         │                 │                   │
         │          ┌──────┴───────┐    ┌──────┴───────┐
         │          │Auth Midware  │    │Auth Midware  │
         │          │JWT → User    │    │JWT → User    │
         │          └──────┬───────┘    └──────┬───────┘
         │                 │                   │
         │                 │            ┌──────┴───────┐
         │                 │            │  Role Check  │
         │                 │            │ role=seller? │
         │                 │            └───┬──────┬───┘
         │                 │                │      │
         │                 │             ✓ Yes   ✗ No
         │                 │                │      │
         │                 │         ┌──────┴──┐   ▼
         │                 │         │ Multer  │  403
         │                 │         │ Upload  │  Forbidden
         │                 │         └────┬────┘
         │                 │              │
         ▼                 ▼              ▼
    ┌──────────────────────────────────────────┐
    │         express-validator                 │
    │    Validate body, params, query          │
    └─────────────────┬────────────────────────┘
                      ▼
            ┌──────────────────┐
            │   Controller     │  ← Business logic
            └──┬───────┬───┬───┘
               │       │   │
        ┌──────┘       │   └──────┐
        ▼              ▼          ▼
  ┌──────────┐  ┌───────────┐  ┌──────────────┐
  │DAO Layer │  │ Services  │  │JSON Response │
  │Aggregation│ │Razorpay   │  │status + data │
  │Pipelines │  │ImageKit   │  └──────────────┘
  └────┬─────┘  │Gmail API  │
       │        └─────┬─────┘
       ▼              ▼
  ┌──────────────────────┐
  │    MongoDB Atlas      │
  └──────────────────────┘
```

Every request passes through Morgan logging, body parsing, and CORS before hitting the route matcher. Depending on the endpoint's access level, it may pass through JWT authentication, role verification, file upload parsing (Multer), and input validation — all before reaching the controller. Controllers delegate data access to the DAO layer (for complex aggregation pipelines) and external integrations to dedicated service modules, keeping business logic decoupled from infrastructure concerns.

---

## Folder Structure

```
Snitch/
├── Backend/
│   ├── server.js                          # Entry point — connects DB, starts Express on port 3000
│   ├── package.json                       # Backend dependencies and scripts
│   ├── .env                               # Environment variables (secrets, DB URI, API keys)
│   ├── public/                            # Production frontend build output (served statically)
│   └── src/
│       ├── app.js                         # Express app setup — middleware, CORS, routes, Passport config
│       ├── config/
│       │   ├── config.js                  # Centralized env-var loader with fail-fast validation
│       │   └── database.js                # Mongoose connection to MongoDB Atlas
│       ├── controllers/
│       │   ├── auth.controller.js         # Register, login, Google OAuth, logout, forgot/reset password
│       │   ├── product.controller.js      # CRUD for products and variants, search with filters
│       │   └── cart.controller.js         # Cart ops, order creation, Razorpay verify, email dispatch
│       ├── dao/
│       │   ├── cart.dao.js                # Cart aggregation pipeline (joins products + variants)
│       │   └── product.dao.js             # Variant stock lookup helper
│       ├── middleware/
│       │   └── auth.middleware.js          # JWT verification + role-based (buyer/seller) guards
│       ├── models/
│       │   ├── user.model.js              # User schema with bcrypt pre-save hook and comparePassword
│       │   ├── product.model.js           # Product with nested variants (images, stock, attributes, price)
│       │   ├── cart.model.js              # Per-user cart with product/variant references
│       │   ├── payment.model.js           # Payment record with Razorpay IDs and order item snapshots
│       │   ├── otp.model.js               # OTP with 10-minute TTL auto-expiry
│       │   └── price.schema.js            # Reusable subdocument schema (amount + currency enum)
│       ├── routes/
│       │   ├── auth.route.js              # Auth endpoints with validation middleware
│       │   ├── product.route.js           # Product endpoints with seller auth + multer upload
│       │   └── cart.route.js              # Cart and payment endpoints with buyer auth
│       ├── services/
│       │   ├── payment.service.js         # Razorpay SDK wrapper — order creation
│       │   └── storage.service.js         # ImageKit SDK wrapper — buffer-based file upload
│       ├── utils/
│       │   └── email.js                   # Gmail REST API email sender with OAuth2 token refresh
│       └── validator/
│           ├── auth.validator.js          # Registration, login, forgot/reset password validation rules
│           ├── product.validator.js       # Product creation validation rules
│           └── cart.validator.js           # Cart add/modify validation rules
│
└── Frontend/
    ├── index.html                         # HTML shell with Google Fonts (Bebas Neue + DM Sans)
    ├── vite.config.js                     # Vite config with Tailwind plugin and API proxy
    ├── package.json                       # Frontend dependencies and scripts
    └── src/
        ├── main.jsx                       # React entry point with Redux Provider
        ├── app/
        │   ├── App.jsx                    # Root component — auth check on mount, router provider
        │   ├── app.routes.jsx             # Route definitions with Protected wrapper for role-based access
        │   ├── app.store.js               # Redux store combining auth, product, cart slices
        │   └── App.css                    # Global styles
        └── features/
            ├── auth/
            │   ├── pages/                 # Register, Login, ForgotPassword pages
            │   ├── components/            # Protected route guard, Google sign-in button
            │   ├── hook/useAuth.js        # Auth actions hook (register, login, getMe, logout)
            │   ├── service/auth.api.js    # Axios calls to /api/auth endpoints
            │   └── state/auth.slice.js    # Redux slice for user and auth loading state
            ├── products/
            │   ├── pages/                 # Home, ProductDetail, SearchProducts, CreateProduct,
            │   │                          #   Dashboard, SellerProductDetail
            │   ├── hooks/useProduct.js    # Product CRUD and search actions hook
            │   ├── service/product.api.js # Axios calls to /api/products endpoints
            │   └── state/product.slice.js # Redux slice for products list and detail state
            ├── cart/
            │   ├── pages/                 # Cart, OrderSuccess pages
            │   ├── hooks/useCart.js        # Cart actions and Razorpay checkout hook
            │   ├── service/cart.api.js    # Axios calls to /api/cart endpoints
            │   └── state/cart.slice.js    # Redux slice for cart items and loading state
            └── Shared/
                └── Components/
                    ├── Nav.jsx            # Global navigation bar
                    └── About.jsx          # About page component
```

---

## Setup & Installation

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas cluster (or local MongoDB instance)
- Razorpay test/live API keys
- ImageKit account
- Google Cloud OAuth 2.0 credentials (for Google sign-in and email sending)

### Backend

```bash
# 1. Clone the repository
git clone https://github.com/your-username/snitch.git
cd snitch/Backend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Fill in the following variables:
#   MONGO_URI            — MongoDB connection string
#   JWT_SECRET_KEY       — Secret for signing JWTs
#   GOOGLE_CLIENT_ID     — Google OAuth client ID
#   GOOGLE_CLIENT_SECRET — Google OAuth client secret
#   IMAGEKIT_PRIVATE_KEY — ImageKit private API key
#   RAZORPAY_KEY_ID      — Razorpay key ID
#   RAZORPAY_KEY_SECRET  — Razorpay key secret
#   GOOGLE_REFRESH_TOKEN — Gmail API refresh token (for sending emails)
#   GOOGLE_USER          — Gmail address used as the sender

# 4. Start development server
npm run dev
# Server runs on http://localhost:3000
```

### Frontend

```bash
# 1. Navigate to frontend directory
cd ../Frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
# Frontend runs on http://localhost:5173 (API calls proxied to backend)
```

---

## API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register a new buyer or seller account | No |
| `POST` | `/api/auth/login` | Login with email and password | No |
| `GET` | `/api/auth/google` | Initiate Google OAuth sign-in flow | No |
| `GET` | `/api/auth/google/callback` | Google OAuth callback (sets JWT cookie, redirects) | No |
| `GET` | `/api/auth/me` | Get current authenticated user profile | Yes |
| `GET` | `/api/auth/logout` | Clear auth cookie and log out | Yes |
| `POST` | `/api/auth/forgot-password` | Send OTP to email for password reset | No |
| `POST` | `/api/auth/reset-password` | Verify OTP and set new password | No |

### Products

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/products` | List all products (paginated) | No |
| `GET` | `/api/products/search?q=&minPrice=&maxPrice=&size=&color=&sort=` | Search and filter products (paginated) | No |
| `GET` | `/api/products/detail/:id` | Get product details by ID | No |
| `GET` | `/api/products/seller` | Get authenticated seller's products (paginated) | Seller |
| `POST` | `/api/products` | Create a new product (multipart, up to 7 images) | Seller |
| `PATCH` | `/api/products/update/product/:id` | Update product details | Seller |
| `DELETE` | `/api/products/delete/:id` | Delete a product | Seller |
| `POST` | `/api/products/:productId/variants` | Add a variant to a product | Seller |
| `PATCH` | `/api/products/update/variant/:productId/:variantId` | Update a product variant | Seller |
| `DELETE` | `/api/products/delete/variant/:productId/:variantId` | Delete a product variant | Seller |

### Cart & Payments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/cart` | Get current user's cart with aggregated totals | Yes |
| `POST` | `/api/cart/add/:productId/:variantId` | Add item to cart (stock-validated) | Yes |
| `PATCH` | `/api/cart/quantity/increment/:productId/:variantId` | Increment cart item quantity by 1 | Yes |
| `PATCH` | `/api/cart/quantity/decrement/:productId/:variantId` | Decrement cart item quantity by 1 | Yes |
| `DELETE` | `/api/cart/item/:productId/:variantId` | Remove item from cart | Yes |
| `POST` | `/api/cart/payment/create/order` | Create Razorpay order from cart | Yes |
| `POST` | `/api/cart/payment/buy-now` | Create Razorpay order for single item (Buy Now) | Yes |
| `POST` | `/api/cart/payment/verify/order` | Verify Razorpay payment and finalize order | Yes |

---

## Future Improvements / Roadmap

- **Order history and tracking** — Persistent order dashboard for buyers to view past purchases, and for sellers to manage fulfillment status (processing → shipped → delivered)
- **Wishlist and save-for-later** — Allow buyers to bookmark products and move items between wishlist and cart, improving conversion rates
- **Review and rating system** — Enable verified buyers to leave product reviews with star ratings, building social proof and helping purchase decisions
- **Admin dashboard with analytics** — Platform-level admin panel with sales metrics, user growth charts, and inventory alerts — enabling data-driven merchandising decisions
- **Expanded Test Coverage** — Implement end-to-end frontend tests using Playwright/Cypress, and add unit testing coverage for controller functions
