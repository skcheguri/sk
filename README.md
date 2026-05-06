# Bhavan — Renter Platform

Bhavan is a web platform that connects renters with landlords and fellow tenants across India. It offers verified property listings, rent management tools, and a supportive community for Indian renters.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Bundler | Vite |
| Styling | Tailwind CSS 3.4 |
| Router | React Router v7 |
| State & Auth | React Context (Supabase-ready) |
| i18n | react-i18next |
| Charts | Recharts |
| Icons | Remix Icon + Lucide React |
| QR Codes | qrcode |
| Build Tooling | ESLint 9 + TypeScript 5.8 |

---

## Project Architecture

### Directory Layout

```
src/
├── components/
│   ├── feature/           # Global feature components (Navbar, Footer, AuthProvider, Toast, SubscriptionProvider)
│   └── base/              # (reserved) Reusable UI primitives
├── pages/
│   ├── home/              # Landing page
│   ├── listings/          # Browse + Listing detail
│   ├── community/         # Forum & discussions
│   ├── about/             # Company story
│   ├── contact/           # Contact form + FAQ
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── list-property/     # Property listing form
│   ├── aadhaar-verify/    # Identity verification flow
│   ├── tenant-profile/    # Tenant dashboard (5 tabs)
│   ├── owner-profile/     # Owner dashboard (10 tabs)
│   ├── landlord-dashboard/ # Analytics dashboard
│   ├── rent-management/   # Rent & lease tools
│   ├── rent-payment/       # UPI, bank, offline payments
│   ├── rent-receipts/      # Receipt generator
│   ├── rental-agreements/ # Agreement generator
│   ├── tax-forms/          # Tax calculators + guides
│   ├── feedback/           # Reviews + ratings
│   ├── notifications/      # Notification center
│   ├── track-requests/     # Maintenance tracking
│   ├── subscription/       # Free vs Pro pricing
│   ├── scan/               # QR scan landing
│   ├── how-it-works/      # Platform guide
│   ├── admin/             # Admin dashboard overview
│   ├── admin/broker-reports/  # Broker report moderation
│   ├── admin/verification/      # Aadhaar verification queue
│   └── admin/community/       # Community content moderation
│   ├── soft-block/            # Account restriction page (soft block status)
│   ├── Forbidden.tsx          # Access Denied error page
│   ├── NotFound.tsx             # 404 Not Found error page
│   └── ServerError.tsx          # 500 Server Error page
├── hooks/
│   ├── useAuth.ts         # Authentication context + mock users
│   ├── useSubscription.ts # Free vs Pro tier logic
│   ├── useContactRateLimit.ts  # 3-layer anti-bypass rate limiting
│   ├── useBrokerReport.ts # Broker reporting + soft block
│   ├── useOwnerRateLimit.ts # Owner action rate limits
│   ├── usePushNotifications.ts # FCM push + fallback delivery
│   ├── useRentPayment.ts  # Payment CRUD + mandate management
│   └── useToast.ts        # Toast notification system
├── mocks/
│   ├── listings.ts
│   ├── community.ts
│   ├── maintenance.ts
│   ├── chat-messages.ts
│   ├── contact-requests.ts
│   ├── notifications.ts
│   ├── notification-channels.ts
│   ├── broker-reports.ts
│   ├── soft-block-states.ts
│   ├── subscriptions.ts
│   ├── rent-payments.ts
│   ├── upi-mandates.ts
│   ├── units.ts
│   ├── verification.ts
│   ├── qr-analytics.ts
│   ├── rent-receipts.ts
│   ├── rental-agreements.ts
│   ├── saved-rental-agreements.ts
│   ├── tenant-tax-documents.ts
│   └── feedback.ts
├── router/
│   ├── config.tsx         # Route definitions (all page routes)
│   └── index.ts           # AppRoutes + global navigate helper
├── lib/
│   ├── supabase.ts        # Supabase client (singleton, lazy-init)
│   └── fingerprint.ts     # Canvas/WebGL device fingerprinting
├── i18n/
│   ├── index.ts           # i18n initialization
│   └── local/             # Translation files per language
└── main.tsx               # App entry point
```

---

## Route Map

| Route | Page | Auth Required |
|---|---|---|
| `/` | Home | No |
| `/listings` | Browse Listings | No |
| `/listings/:id` | Listing Detail | No |
| `/community` | Community Forum | No |
| `/about` | About Us | No |
| `/contact` | Contact | No |
| `/how-it-works` | How It Works | No |
| `/feedback` | Reviews | No |
| `/login` | Login | No |
| `/signup` | Signup | No |
| `/aadhaar-verify` | Aadhaar Verification | Yes |
| `/tenant-profile` | Tenant Dashboard | Yes |
| `/owner-profile` | Owner Dashboard | Yes |
| `/landlord-dashboard` | Analytics | Yes (Owner) |
| `/list-property` | List Property | Yes (Owner) |
| `/scan/:id` | QR Landing | No |
| `/tax-forms` | Tax Forms | Yes |
| `/rent-receipts` | Receipt Generator | Yes |
| `/rental-agreements` | Agreement Generator | Yes |
| `/notifications` | Notification Center | Yes |
| `/track-requests` | Request Tracking | Yes (Tenant) |
| `/rent-payment` | Rent Payment | Yes |
| `/rent-management` | Rent & Lease Tools | Yes (Owner) |
| `/subscription` | Subscription Plans | Yes (Owner) |
| `/403` | Access Denied | No |
| `/404` | Not Found | No |
| `/500` | Server Error | No |
| `/soft-block` | Account Restriction | Yes (Tenant) |
| `/admin` | Admin Dashboard | Yes (Admin) |
| `/admin/broker-reports` | Broker Report Moderation | Yes (Admin) |
| `/admin/verification` | Aadhaar Verification Queue | Yes (Admin) |
| `/admin/community` | Community Moderation | Yes (Admin) |

---

## Key Architectural Patterns

### 1. Mock-First, Supabase-Ready
All data flows through hooks that check `isSupabaseConnected()`. When Supabase is not configured, the app falls back to in-memory mock data. When connected, it switches to real database queries seamlessly.

**Pattern:**
```
Hook checks supabase instance
  → If connected: query Supabase tables
  → If not connected: read from src/mocks/*.ts
```

### 2. Role-Based Dashboards
Two distinct user roles with separate dashboards:
- **Tenant Home** (`/tenant-profile`): Overview, Saved Listings, My Inquiries, Documents, Settings
- **Owner Home** (`/owner-profile`): Overview, Properties, Listings, Tenants, Inquiries, Messages, Requests, Documents, Billing, Settings

Role is set at signup and stored in the auth context.

### 3. Trust & Safety Stack
- **Rate Limiting**: 3-layer system (user / device fingerprint / IP) with escalating limits
- **Broker Reporting**: Owners can flag tenants; 2 reports in 48h triggers soft block
- **Soft Block Resolution**: Aadhaar re-verification + additional details form
- **Aadhaar Verification**: OCR extraction → name matching → provider verification (IDfy/Signzy)

### 4. Subscription Model (Freemium for Owners)
- **Free Tier**: Unlimited properties, unlimited listings, unlimited inquiries
- **Pro Tier**: ₹199/mo or ₹999/year — unlimited everything + analytics + auto-reminders + priority placement
- **Razorpay Integration**: Subscription tokens stored in `owner_subscriptions` table
- **Grace Period**: 7 days after failed renewal before reverting to Free

### 5. Payment Integration
- UPI AutoPay (Razorpay token-based)
- UPI QR codes
- Bank transfer + offline payment logging
- Payment failure handling with retry + reconciliation panel
- Unit-level payment tracking via `property_unit_id` on rent payments

### 6. Notification System
- Browser push via Firebase Cloud Messaging
- SMS and email fallback for critical events
- Delivery status tracking per notification (`push_delivered`, `sms_delivered`, `email_delivered`, `read_at`)
- Channel preferences (push / SMS / email toggles)

---

## Environment Variables

When connecting to Supabase, create a `.env` file at the project root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

No other environment variables are required for local development with mock data.

---

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint check
npm run type-check   # TypeScript type checking
```

---

## Development Notes

### Mock Data
- All mock files live in `src/mocks/` and export named constants
- Mock data is realistic and complete — never empty or placeholder-only
- When Supabase is connected, mock files should be removed and hooks updated to use real queries

### Adding a New Page
1. Create the page component under `src/pages/[page-name]/page.tsx`
2. Add the route to `src/router/config.tsx`
3. Add navigation link in `Navbar.tsx` if needed
4. Follow existing page styling (brand colors, spacing, responsive breakpoints)

### Custom Hooks
- `useAuth`: Authentication state, login/logout, profile updates
- `useSubscription`: Tier checking, feature gating, billing history
- `useContactRateLimit`: 3-layer rate limiting for tenant contact attempts
- `useBrokerReport`: Broker flagging + soft block triggers
- `useOwnerRateLimit`: Owner action throttling (inquiries, chat, community)
- `usePushNotifications`: FCM registration + delivery tracking
- `useRentPayment`: Payment methods, history, mandates, reconciliation

---

## Data Model Summary

**Core Tables** (Supabase schema, mocked locally):
- `users` — accounts with role (tenant/owner)
- `properties` — owner properties with derived unit counts
- `units` — per-unit rent, tenant, lease, payment status
- `listings` — property listings with metadata + counts
- `connection_requests` — tenant inquiries to landlords
- `chat_messages` — tenant-landlord threaded messages
- `broker_reports` — owner-reported broker flags
- `soft_block_states` — active restriction records
- `community_posts` — forum posts and discussions
- `owner_subscriptions` — subscription status + Razorpay tokens
- `billing_history` — invoices with GST tracking
- `subscription_features` — per-owner feature flags
- `rent_payments` — payment records with unit-level tracking
- `upi_mandates` — auto-debit mandate records
- `contact_attempts` — rate limit audit trail
- `user_push_tokens` — FCM device registration for push notifications
- `audit_logs` — before/after action snapshots for moderation and fraud detection
- `saved_listings` — user bookmarked listings
- `documents` — uploaded agreements, receipts, Aadhaar, utility bills
- `qr_analytics` — per-listing scan and conversion tracking

---

## License

Private — Bhavan Platform