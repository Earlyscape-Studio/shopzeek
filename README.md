# Zeek

Zeek is a high-performance, full-stack e-commerce platform custom-built for **Zeek**, specializing in premium beauty and fashion products. Built using the Next.js App Router, TypeScript, and Supabase, the platform provides a seamless retail experience for customers and a robust management dashboard for administrators.

---

## 🚀 Features

### 🛒 Customer Storefront
* **Dynamic Catalog:** Slug-based dynamic product routing with advanced filtering and sorting.
* **Persistent Cart & Wishlist:** Smooth cart mechanics utilizing a slide-out drawer architecture and authenticated state synchronization.
* **User Accounts:** Secure authorization flows covering Sign Up, Login, Forgot Password, and Profile Management with custom order status steppers.
* **Instant Support:** Directly integrated WhatsApp chat floating actions for rapid customer support.

### 💳 Payments & Logistics (NGN Optimized)
* **Multi-Gateway Payment Integration:** Production-ready integrations with **Flutterwave** and **GlobalPay** processing webhooks securely.
* **Local Bank Transfers:** Custom infrastructure to initialize and verify direct bank transfers natively in Nigerian Naira (**NGN**).
* **Automated Logistics:** Real-time shipping cost computation and automated delivery scheduling powered by **Fez Delivery**.

### 📊 Comprehensive Admin Panel
* **Product Management:** Complete inventory dashboard managing product CRUD states, feature toggles, and catalog metadata.
* **Order Tracking & Fulfillment:** Dedicated order lookup modules exposing complete billing breakdowns and integrated shipping actions.
* **Promotions Engine:** Custom coupon builder sheet allowing admins to generate, track, and deplete coupon rules.

### 📧 Dynamic Communications & Documents
* **Automated Email Pipelines:** Professionally styled transactional templates for Welcome, Order Receipts, Abandoned Carts, and Delivery Schedules.
* **On-Demand PDF Invoicing:** Post-charge client dashboard overlay featuring immediate client-side PDF receipt generation and downloading.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js (App Router, Server Actions) |
| **Language** | TypeScript |
| **Database & Auth** | Supabase |
| **Styling** | TailwindCSS |
| **UI Components** | Shadcn UI (Custom input groups, fields, sheets, dialogs) |
| **Logistics** | Fez Delivery API |
| **Payment Gateways** | Flutterwave API, GlobalPay API |

---

## 🛠️ Getting Started

### Prerequisites
Make sure you have Node.js installed and use **npm** as the package manager to avoid lockfile conflicts:
```bash
npm install -g npm

git clone <repository-url>
cd shopzeek

npm install

Create a .env.local file in the root directory and configure your backend services:

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Payment Gateways
FLUTTERWAVE_PUBLIC_KEY=your_wave_public_key
FLUTTERWAVE_SECRET_KEY=your_wave_secret_key
FLUTTERWAVE_HASH_SECRET=your_webhook_hash

GLOBALPAY_SECRET_KEY=your_globalpay_secret

# Logistics
FEZ_DELIVERY_API_KEY=your_fez_key

# Communication
RESEND_API_KEY=your_resend_email_key


npm dev

Open http://localhost:3000 in your browser to view the application.


📂 Architecture Overview
The codebase is engineered around highly decoupled Next.js Server Actions and shared layout structures:

app/actions/: Houses clean server-side business logic isolating address validation, payment validation callbacks, third-party logistics integrations, and transactional mail loops.

app/api/: Secure, stateless endpoints built explicitly to process webhooks broadcasted by GlobalPay and Flutterwave systems.

components/shared/: Modular presentation layers separating specific storefront layouts, user workflows, invoice-to-pdf pipelines, and automated email layouts.