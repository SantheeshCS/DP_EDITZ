# Aesthetix Template Marketplace

A premium, high-performance, full-stack digital marketplace template web application. Visual artists and creators can browse, search, purchase (via Stripe), and download editing assets, digital graphics, and video LUTs without account registrations. Administrators manage inventories, upload previews and secure download packages (via Supabase), and trace live earnings.

This repository contains three modules:
- `/backend`: Node.js + Express API server mapped with MongoDB Atlas, Stripe Payments, and Supabase Storage.
- `/admin-panel`: Sleek, dark-themed React + Vite administrative dashboard with JWT login, stats grids, and multipart upload forms.
- `/public-store`: Beautiful, modern customer-facing storefront featuring dark-mode gradients, search filters, detail inspection, and secure 15-minute download links.

---

## 🛠️ Tech Stack & Services

- **Backend API**: Node.js + Express
- **Administrative Frontend**: React (Vite-powered, Tailwind CSS, Lucide icons, toast alerts)
- **Public Storefront**: React (Vite-powered, Outfit typography, glassmorphism CSS, neon glow layers)
- **Database**: MongoDB Atlas (Free Tier)
- **Asset Storage**: Supabase Storage (Free 1GB Tier - public & private buckets)
- **Payments Processing**: Stripe Checkout + Webhook Event Integrations
- **Authentication**: JWT (JSON Web Tokens) with local encryption using `bcryptjs`

---

## 📂 Project Structure

```text
/backend
  /models
    - Template.js            # Mongoose template schema
    - Order.js               # Mongoose order checkout tracker
  /routes
    - adminRoutes.js         # JWT login, multer multipart uploads, edits, deletes
    - templateRoutes.js      # Public inventory listings and inspection detail endpoints
    - orderRoutes.js         # Order creators, Stripe session initializers, verify downloads
    - webhookRoutes.js       # Raw endpoint verifying signatures & completing purchases
  /middleware
    - authMiddleware.js      # Bearer authorization guards
  /utils
    - supabase.js            # Client configuration, public uploads, private signed links
    - stripe.js              # Checkout session builder
  server.js                  # App configurations and MongoDB connection
  .env.example               # Guide for local secret keys
/admin-panel                 # Administrative Dashboard SPA
/public-store                # Public customer storefront SPA
README.md                    # This document
```

---

## 🔑 Setup Guides (Free Tiers)

### 1. MongoDB Atlas Setup
1. Sign up for a free account at [mongodb.com/atlas](https://www.mongodb.com/products/platform/atlas-database).
2. Create an **M0 Cluster** (512MB permanently free tier).
3. Under **Database Access**, create a database user with a username and password.
4. Under **Network Access**, whitelist `0.0.0.0/node` (allow all connections) for local development and Render deployments.
5. Copy the connection string under **Connect** -> **Drivers** (Node.js version 4.x or later) to use as your `MONGODB_URI`.

### 2. Supabase Storage Setup
1. Sign up at [supabase.com](https://supabase.com) and spin up a new project.
2. Navigate to **Storage** in the sidebar.
3. Create two buckets:
   - **`previews`**: Toggle **"Make bucket public"** to **ON**. (Stores watermarked image assets).
   - **`templates`**: Toggle **"Make bucket public"** to **OFF** (Keep Private). (Stores zipped template deliverables).
4. Go to **Project Settings** -> **API** and copy:
   - **Project URL** (used as `SUPABASE_URL`)
   - **`service_role` key** (used as `SUPABASE_SERVICE_ROLE_KEY` - *Never expose this key in frontend apps*).

### 3. Stripe Payments Setup
1. Register for a free account at [stripe.com](https://stripe.com).
2. Toggle on **"Test Mode"** on the upper right of the Stripe Dashboard.
3. Navigate to **Developers** -> **API Keys** and copy:
   - **Publishable Key** (only if needed, but not required since Stripe hosts checkout)
   - **Secret Key** (used as `STRIPE_SECRET_KEY`)
4. To test webhooks locally, install the **Stripe CLI**:
   - Download the CLI for Windows/macOS/Linux.
   - Run `stripe login` in your terminal to authenticate.
   - Run `stripe listen --forward-to localhost:5000/api/webhook` to listen to webhook updates locally.
   - Copy the printed webhook signing secret `whsec_...` to use as `STRIPE_WEBHOOK_SECRET`.

---

## 💻 Local Quickstart

### Step 1: Configure Backend Environment
Create a `.env` file in the `/backend` folder using `/backend/.env.example` as a template:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_32_character_jwt_secret
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_secret
STRIPE_SECRET_KEY=sk_test_your_secret
STRIPE_WEBHOOK_SECRET=whsec_your_local_or_production_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=$2a$10$vNIPY1hH/z1tO/XbJc.W8uL5VfE8F/0oV2Lp1c.mS/7rI5D2K6Cki  # bcrypt hash for "admin123"
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

### Step 2: Install and Run backend
```bash
cd backend
npm install
npm run dev
```

### Step 3: Run Admin Panel
Create a `.env` file inside `/admin-panel`:
```env
VITE_API_URL=http://localhost:5000/api
```
Run the application:
```bash
cd admin-panel
npm install
npm run dev
```
Open [http://localhost:5174](http://localhost:5174) (or check Vite's port) in your browser. Log in using `admin@example.com` and `admin123`.

### Step 4: Run Public Storefront
Create a `.env` file inside `/public-store`:
```env
VITE_API_URL=http://localhost:5000/api
```
Run the application:
```bash
cd public-store
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) (or check Vite's port) in your browser.

---

## 🚀 Cloud Deployment

### Backend Hosting: Render
1. Register for a free web service tier at [render.com](https://render.com).
2. Connect your Git repository.
3. Configure the following parameters in the Render Dashboard:
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
4. Add all environment variables from the `.env` file in Render's **Environment** tab.
5. Set `NODE_ENV=production`.
6. Copy Render's deployed URL (e.g. `https://your-app.onrender.com`).
7. Update Stripe Dashboard -> Webhooks: Add `https://your-app.onrender.com/api/webhook` as your webhook endpoint and choose the `checkout.session.completed` event. Update the `STRIPE_WEBHOOK_SECRET` in Render.

### Frontend Hosting: Vercel
Deploy both frontends as separate projects on [vercel.com](https://vercel.com).

#### Public Storefront Deployment:
1. Link your repository and create a new project.
2. Select root directory `/public-store`.
3. Add Environment Variable:
   - `VITE_API_URL` = `https://your-backend-url.onrender.com/api`
4. Deploy. Copy the live URL and paste it as `CLIENT_URL` in the backend Render environment.

#### Admin Panel Deployment:
1. Link your repository and create a new project.
2. Select root directory `/admin-panel`.
3. Add Environment Variable:
   - `VITE_API_URL` = `https://your-backend-url.onrender.com/api`
4. Deploy. Copy the live URL and paste it as `ADMIN_URL` in the backend Render environment.

---

## 🔒 Security Practices Done

- **Supabase Privacies**: The purchasable `templates` bucket is private. No user, even with Supabase direct credentials, can read or download these files without a valid, signed link.
- **Signed URL Expirations**: Link tokens expire in 15 minutes. Regenerating links requires an active paid status.
- **Webhook Verifications**: In `/api/webhook`, the signature header is validated using Stripe's native construct events. Requests without signatures are discarded.
- **Bcrypt Encryptions**: Plain-text passwords are never saved. Login operations compare inputs against cryptographically secure hashes.
- **JWT Lifetimes**: Admin JWTs last exactly 24 hours. Interceptors monitor `401` states and redirect expired panels back to `/login`.
