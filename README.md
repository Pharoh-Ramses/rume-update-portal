# RUME Patient Portal

A healthcare billing patient portal that solves insurance claim denials by giving patients two clear options: update their insurance information for resubmission or pay directly at discounted rates.

## 🎯 Problem & Solution

**The Problem**: Healthcare providers struggle with insurance claim denials and delays, creating administrative burden and patient payment issues. Our client has dealt with this for 3 years.

**The Solution**: When insurance doesn't pay, patients receive a link to this portal where they can:
1. **Update Insurance** → Upload new cards/info → Claims get resubmitted
2. **Pay Directly** → Get 30-50% discounts → Skip insurance entirely

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your database, Stripe, S3, and email service credentials

# Set up database
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

Visit http://localhost:3001

## 📋 Features

### ✅ Implemented
- **Magic Link Authentication** - Email-based login with optional password setup
- **Database Schema** - 7 tables tracking patients, services, payments, insurance
- **Professional UI** - RUME-branded layout with Tailwind CSS
- **Security** - Route protection, encrypted storage, PCI-compliant payments
- **File Upload** - S3 integration for insurance card photos

### 🔄 In Development (Phase 4)
- **Services Table** - Display unpaid services with pricing calculations
- **Insurance Panel** - Upload/update insurance information
- **Payment Interface** - Stripe integration for direct payments
- **Dashboard Integration** - Connect all components with real data

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Auth.js with magic links
- **Payments**: Stripe
- **Storage**: S3-compatible (Tigris)
- **Email**: Resend

### Database Schema
```typescript
patients          // Patient records with contact info
services          // Medical services with pricing
insurance_cards   // Uploaded insurance card images  
insurance_updates // Insurance update requests
payments          // Payment records via Stripe
magic_links       // Authentication tokens
patient_actions   // Activity tracking
```

### Key Files
```
src/
├── app/
│   ├── dashboard/           # Main patient dashboard
│   ├── auth/               # Authentication pages
│   └── api/                # Backend API routes
├── components/
│   ├── dashboard/          # Dashboard components (in development)
│   └── layout/             # Header, footer components
├── lib/
│   ├── auth/              # Auth.js configuration
│   ├── db/                # Database schema & queries
│   └── storage/           # S3 file upload utilities
└── constants/pricing.ts   # Discount rate calculations
```

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server (port 3001)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks

# Database commands
npm run db:generate  # Generate migrations
npm run db:migrate   # Apply migrations  
npm run db:studio    # Open database GUI
npm run db:seed      # Load sample data
```

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
AUTH_SECRET=your-secret-key

# Email Service
RESEND_API_KEY=your-resend-key

# Payment Processing
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# File Storage (S3-compatible)
TIGRIS_ACCESS_KEY_ID=your-access-key
TIGRIS_SECRET_ACCESS_KEY=your-secret-key
TIGRIS_BUCKET_NAME=your-bucket-name
TIGRIS_ENDPOINT_URL=https://...
```

## 🔐 Security

- **Authentication**: Magic link tokens expire after use
- **Route Protection**: Middleware protects patient data
- **File Uploads**: S3 with proper validation
- **Payments**: Stripe handles all PCI compliance
- **Data Privacy**: All patient actions logged and tracked

## 💼 Business Logic

### Core Rules
- Patients can **EITHER** update insurance **OR** pay directly (not both for same services)
- Discount rates: 30% standard, 50% premium
- Insurance updates trigger automatic resubmission
- All patient actions are logged for audit trails

### User Flow
1. Patient receives email link when insurance denies claim
2. Magic link login (+ password setup if first time)
3. Dashboard shows unpaid services with two options:
   - **Update Insurance**: Upload cards → provider resubmits to insurance
   - **Pay Direct**: Select services → pay discounted amount via Stripe

## 🧪 Testing

### Manual Testing Checklist
- [ ] Magic link authentication flow
- [ ] Password setup for new users  
- [ ] Dashboard loads patient services correctly
- [ ] Service selection and pricing calculations
- [ ] Insurance card file uploads to S3
- [ ] Payment processing via Stripe
- [ ] Email notifications

### Sample Data
Run `npm run db:seed` to load test patients and services for development.

## 📊 Current Status: Phase 4

**Ready for**: Dashboard component implementation

**Next Tasks**:
1. Complete `ServicesTable` component with real-time pricing
2. Finish `InsurancePanel` with S3 file uploads
3. Implement `PaymentInterface` with Stripe integration
4. Connect dashboard API endpoints to load patient data

## 🤝 Contributing

1. Follow existing code conventions and patterns
2. Run `npm run lint` and `npm run typecheck` before committing
3. Test authentication flows and payment processing
4. Ensure all patient data handling follows security best practices

## 📞 Support

This portal solves a real healthcare billing problem - reducing administrative burden while giving patients fair payment options. The goal is to turn a 3-year insurance headache into a smooth, professional patient experience.

---

**Built with ❤️ for healthcare providers and their patients**