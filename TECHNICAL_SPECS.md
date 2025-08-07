# Technical Specifications - RUME Patient Portal

## 🏗️ Architecture Overview

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Auth.js (NextAuth.js v5)
- **Payments**: Stripe
- **Storage**: AWS S3 (Tigris)
- **Email**: Resend

### Project Structure
```
rume-update-portal/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # React components
│   ├── lib/                    # Utilities and configurations
│   └── constants/              # Application constants
├── drizzle/                    # Database migrations
├── public/                     # Static assets
└── configuration files
```

## 🗄️ Database Schema

### Tables & Relationships

#### `patients`
```sql
id: serial PRIMARY KEY
email: varchar(255) UNIQUE NOT NULL
first_name: varchar(100) NOT NULL
last_name: varchar(100) NOT NULL
phone: varchar(20)
date_of_birth: date
address_line1: varchar(255)
address_line2: varchar(255)
city: varchar(100)
state: varchar(2)
zip_code: varchar(10)
created_at: timestamp DEFAULT now()
updated_at: timestamp DEFAULT now()
```

#### `services`
```sql
id: serial PRIMARY KEY
patient_id: integer REFERENCES patients(id)
service_code: varchar(20) NOT NULL
service_description: text NOT NULL
service_date: date NOT NULL
original_amount: decimal(10,2) NOT NULL
insurance_billed_amount: decimal(10,2)
denial_reason: text
provider_name: varchar(255)
provider_contact: varchar(255)
created_at: timestamp DEFAULT now()
```

#### `insurance_cards`
```sql
id: serial PRIMARY KEY
patient_id: integer REFERENCES patients(id)
front_image_url: varchar(500)
back_image_url: varchar(500)
uploaded_at: timestamp DEFAULT now()
```

#### `insurance_updates`
```sql
id: serial PRIMARY KEY
patient_id: integer REFERENCES patients(id)
insurance_company: varchar(255)
policy_number: varchar(100)
group_number: varchar(100)
subscriber_name: varchar(255)
relationship_to_subscriber: varchar(50)
effective_date: date
front_card_url: varchar(500)
back_card_url: varchar(500)
status: varchar(20) DEFAULT 'pending'
submitted_at: timestamp DEFAULT now()
processed_at: timestamp
```

#### `payments`
```sql
id: serial PRIMARY KEY
patient_id: integer REFERENCES patients(id)
stripe_payment_intent_id: varchar(255) UNIQUE
amount: decimal(10,2) NOT NULL
discount_applied: decimal(4,2)
selected_services: jsonb
status: varchar(20) DEFAULT 'pending'
created_at: timestamp DEFAULT now()
completed_at: timestamp
```

#### `magic_links`
```sql
id: serial PRIMARY KEY
patient_id: integer REFERENCES patients(id)
token: varchar(255) UNIQUE NOT NULL
expires_at: timestamp NOT NULL
used_at: timestamp
created_at: timestamp DEFAULT now()
```

#### `patient_actions`
```sql
id: serial PRIMARY KEY
patient_id: integer REFERENCES patients(id)
action_type: varchar(50) NOT NULL
action_details: jsonb
ip_address: varchar(45)
user_agent: text
created_at: timestamp DEFAULT now()
```

## 🔐 Authentication System

### Magic Link Flow
1. **Initial Access**: Patient receives magic link via email
2. **Token Verification**: Link contains unique token with expiration
3. **First Visit**: Redirect to password setup if no password exists
4. **Subsequent Visits**: Standard email/password login
5. **Session Management**: Auth.js handles session persistence

### Implementation Files
- `src/lib/auth/config.ts` - Auth.js configuration
- `src/lib/auth/magic-links.ts` - Magic link generation and verification
- `src/app/auth/` - Authentication pages
- `middleware.ts` - Route protection

### Security Features
- Tokens expire after 24 hours
- One-time use tokens
- Password hashing with bcrypt
- Session-based authentication
- Protected routes via middleware

## 💳 Payment Processing

### Stripe Integration
- **Payment Intents**: Secure payment processing
- **Webhooks**: Payment confirmation handling
- **Discounts**: 30-50% off original pricing
- **Receipt Generation**: Automatic email receipts

### Discount Calculation
```typescript
// src/constants/pricing.ts
export const DISCOUNT_RATES = {
  STANDARD: 0.30,  // 30% off
  PREMIUM: 0.50    // 50% off
};

export const calculateDiscountedPrice = (
  originalAmount: number,
  discountRate: number = DISCOUNT_RATES.STANDARD
): number => {
  return originalAmount * (1 - discountRate);
};
```

## 📁 File Upload System

### S3 Storage (Tigris)
- **Insurance Cards**: Front and back photos
- **File Validation**: Type and size restrictions
- **Secure URLs**: Pre-signed URLs for uploads
- **Organization**: Patient-specific folders

### Implementation
```typescript
// src/lib/storage/s3.ts
- uploadInsuranceCard()
- generatePresignedUrl()
- deleteFile()
```

## 🎨 UI/UX Design System

### Color Palette
- **Primary**: `rume-blue` (#E6EDFA)
- **Text**: Tailwind gray scale
- **Accents**: Blue and green for actions
- **Backgrounds**: White and light gray

### Component Structure
```
components/
├── layout/
│   ├── Header.tsx       # Navigation and branding
│   └── Footer.tsx       # Company information
├── ui/                  # Reusable UI components
└── dashboard/           # Dashboard-specific components (TO BUILD)
    ├── ServicesTable.tsx
    ├── InsurancePanel.tsx
    └── PaymentInterface.tsx
```

### Responsive Design
- **Mobile-first**: Tailwind responsive classes
- **Breakpoints**: sm, md, lg, xl
- **Touch-friendly**: Adequate button sizes
- **Accessibility**: ARIA labels and keyboard navigation

## 🔧 Development Workflow

### Environment Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### Database Management
```bash
# Generate migrations after schema changes
npm run db:generate

# Apply migrations
npm run db:migrate

# Open database GUI
npm run db:studio
```

### Code Quality
```bash
# Linting
npm run lint

# Type checking
npm run typecheck

# Build verification
npm run build
```

## 📧 Email System

### Resend Integration
- **Magic Links**: Authentication emails
- **Receipts**: Payment confirmations
- **Notifications**: Insurance update confirmations
- **Templates**: HTML email templates

### Email Types
1. **Magic Link**: Initial access and password reset
2. **Payment Receipt**: Successful payment confirmation
3. **Insurance Update**: Confirmation of insurance submission
4. **Welcome**: First-time user onboarding

## 🔍 Monitoring & Logging

### Patient Actions Tracking
- **Action Types**: login, payment, insurance_update, file_upload
- **Details**: JSON metadata for each action
- **IP/User Agent**: Basic request information
- **Timestamps**: All actions timestamped

### Error Handling
- **Try/Catch**: Comprehensive error boundaries
- **User Feedback**: Friendly error messages
- **Logging**: Server-side error logging
- **Fallbacks**: Graceful degradation

## 🚀 Deployment Considerations

### Environment Variables
```bash
# Database
DATABASE_URL=

# Authentication
AUTH_SECRET=
NEXTAUTH_URL=

# Email
RESEND_API_KEY=

# Payments
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Storage
TIGRIS_ACCESS_KEY_ID=
TIGRIS_SECRET_ACCESS_KEY=
TIGRIS_BUCKET_NAME=
TIGRIS_ENDPOINT_URL=
```

### Performance Optimizations
- **Next.js App Router**: Automatic code splitting
- **Image Optimization**: Next.js Image component
- **Database Indexing**: Optimized queries
- **Caching**: Strategic caching for static content

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] Magic link authentication flow
- [ ] Password setup and login
- [ ] Dashboard data loading
- [ ] Service selection and calculations
- [ ] File uploads to S3
- [ ] Payment processing
- [ ] Email notifications
- [ ] Mobile responsiveness
- [ ] Error handling

### Automated Testing (Future)
- Unit tests for utility functions
- Integration tests for API routes
- E2E tests for critical user flows
- Database migration testing

## 📋 API Routes Structure

### Current Routes
- `POST /api/auth/magic-link` - Generate magic link
- `GET /api/auth/verify-token` - Verify magic link token
- `POST /api/auth/setup-password` - Set initial password

### Future Routes (Phase 5)
- `GET /api/patient/services` - Get patient services
- `GET /api/patient/insurance` - Get insurance information
- `POST /api/insurance/update` - Submit insurance update
- `POST /api/payments/create-intent` - Create Stripe payment
- `POST /api/files/upload` - Handle file uploads

This technical specification provides a complete blueprint for continuing development of the RUME Patient Portal.