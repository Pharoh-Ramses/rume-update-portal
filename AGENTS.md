# AI Agent Documentation - RUME Patient Portal

## 🎯 Project Overview
Healthcare billing patient portal built with Next.js 15 where patients can either update insurance information to resubmit claims OR pay directly at discounted rates (30-50% off). Provider has struggled 3 years with insurance denials/delays.

## 🚀 Development Commands
```bash
# Start development server
npm run dev  # Runs on http://localhost:3001

# Database operations
npm run db:generate  # Generate migrations
npm run db:migrate   # Apply migrations
npm run db:studio    # Open Drizzle Studio (database GUI)

# Code quality (run these before committing)
npm run lint
npm run typecheck
npm run build  # Test production build
```

## 📊 Current Status: PHASE 4 READY
- ✅ **Authentication System**: Magic links + password login fully working
- ✅ **Database Schema**: 7 tables with sample data loaded
- ✅ **Layout & UI**: Professional header/footer with RUME branding
- ✅ **Home Page**: Hero section + billing explanation content
- 🔄 **NEXT**: Dashboard components for core patient functionality

## 🗂️ Key Architecture

### Database Schema (src/lib/db/schema.ts)
```typescript
// 7 main tables:
patients          // Patient records with contact info
services          // Medical services with pricing
insurance_cards   // Uploaded insurance card images
insurance_updates // Insurance update requests
payments          // Payment records via Stripe
magic_links       // Authentication tokens
patient_actions   // Activity tracking
```

### Authentication Flow (src/lib/auth/)
- Magic link email → token verification → password setup (first time) OR direct login
- Route protection via middleware.ts
- Auth.js configuration with database adapter

### File Structure
```
src/
├── app/
│   ├── layout.tsx           # Root layout (header/footer)
│   ├── page.tsx             # Home page with hero
│   ├── dashboard/page.tsx   # Main patient dashboard (placeholder)
│   └── auth/                # Authentication pages
├── components/
│   ├── layout/              # Header, Footer components
│   └── ui/                  # Reusable UI components
├── lib/
│   ├── auth/                # Auth.js config, magic links
│   ├── db/                  # Database schema, queries
│   └── storage/             # S3 file upload utilities
└── constants/pricing.ts     # Discount calculations
```

## 🎯 IMMEDIATE NEXT TASKS

### Phase 4: Dashboard Components
The dashboard (src/app/dashboard/page.tsx) needs these core components:

1. **ServicesTable Component**
   - Display patient's medical services with original/discounted pricing
   - Checkboxes for service selection with running total
   - Show insurance denial reasons + provider contact info
   - Calculate real-time totals based on selection

2. **InsurancePanel Component**
   - Display current insurance information
   - File upload for insurance card photos (front/back) using S3
   - Manual entry form for policy updates
   - Submit insurance update requests

3. **PaymentInterface Component**
   - Service selection with Stripe integration
   - Payment confirmation and processing
   - Receipt generation and email

4. **Dashboard Data Integration**
   - Connect components to database queries
   - Load patient's actual services and insurance data
   - Implement the two main user flows

### Database Queries Needed
```typescript
// In src/lib/db/queries.ts
getPatientServices(patientId)     // Load services for dashboard
getPatientInsurance(patientId)    // Load current insurance info
createInsuranceUpdate(data)       // Submit insurance updates
createPayment(data)               // Process payments
```

## 🔧 Technical Implementation Notes

### Styling & Branding
- Custom `rume-blue` color: #E6EDFA
- Tailwind CSS 4 with custom theme
- Mobile-first responsive design
- Professional healthcare aesthetic

### Key Constants (src/constants/pricing.ts)
```typescript
DISCOUNT_RATES = {
  STANDARD: 0.30,    // 30% off
  PREMIUM: 0.50      // 50% off
}
```

### Environment Variables Required
```bash
DATABASE_URL=          # PostgreSQL connection
AUTH_SECRET=           # Auth.js secret
RESEND_API_KEY=        # Email service
STRIPE_SECRET_KEY=     # Payment processing
TIGRIS_ACCESS_KEY_ID=  # S3 storage
TIGRIS_SECRET_ACCESS_KEY=
TIGRIS_BUCKET_NAME=
TIGRIS_ENDPOINT_URL=
```

## 🧪 Testing & Verification

### Manual Testing Checklist
- [ ] Magic link authentication flow
- [ ] Password setup for new users
- [ ] Dashboard loads patient data correctly
- [ ] Service selection and pricing calculations
- [ ] Insurance card file uploads
- [ ] Payment processing via Stripe
- [ ] Email notifications

### Sample Data Available
- Patient records in database (accessible via Drizzle Studio)
- Test services with pricing
- Use for development and testing

## 🚨 Important Notes

### Security Considerations
- All file uploads go through S3 with proper validation
- Patient data is protected by authentication middleware
- Stripe handles all payment processing (PCI compliant)
- Magic links expire after use

### Business Logic
- Patients can EITHER update insurance OR pay directly (not both)
- Discounted rates are 30-50% off original pricing
- Insurance updates trigger resubmission to insurance company
- All actions are logged in patient_actions table

## 📞 Support & Context
This portal solves a 3-year problem with insurance claim denials. Patients receive this link when their insurance doesn't pay, giving them two clear options to resolve their bill. The goal is to reduce administrative burden while offering patients fair alternatives.

---

**Ready for Phase 4**: Dashboard component implementation with full patient functionality.