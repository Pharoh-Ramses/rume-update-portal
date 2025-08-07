# Database Setup

This project uses PostgreSQL with Drizzle ORM for database management.

## Prerequisites

1. PostgreSQL database running locally or remotely
2. Environment variables configured in `.env.local`

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your database credentials:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/rume_portal"
```

## Database Commands

### Generate Migration
```bash
npm run db:generate
```

### Apply Migration (Push to Database)
```bash
npm run db:push
```

### Seed Database with Sample Data
```bash
npm run db:seed
```

### Test Database Connection
```bash
npm run db:test
```

### Open Drizzle Studio (Database GUI)
```bash
npm run db:studio
```

## Database Schema

### Tables

- **patients** - Patient account information
- **services** - Medical services rendered with pricing
- **magic_links** - Authentication tokens for magic link login
- **insurance_cards** - Insurance card information and uploaded images
- **insurance_updates** - Tracking of insurance information updates
- **payments** - Stripe payment records
- **patient_actions** - Activity logging for analytics

### Sample Data

The seed script creates:
- 3 sample patients with different insurance companies
- Multiple services per patient with denial reasons
- Insurance card information
- Magic links for testing authentication

### Magic Link URLs (After Seeding)

The seed script will output magic link URLs that you can use for testing:
- `http://localhost:3001/auth/magic?token=<token>`

## File Storage

Insurance card images are stored in Tigris S3-compatible storage. Configure these environment variables:

```bash
TIGRIS_ACCESS_KEY_ID="your-access-key"
TIGRIS_SECRET_ACCESS_KEY="your-secret-key"
TIGRIS_BUCKET_NAME="rume-portal-files"
TIGRIS_REGION="auto"
TIGRIS_ENDPOINT="https://fly.storage.tigris.dev"
```

## Development Workflow

1. Make schema changes in `src/lib/db/schema.ts`
2. Generate migration: `npm run db:generate`
3. Apply to database: `npm run db:push`
4. Test connection: `npm run db:test`
5. Seed with sample data: `npm run db:seed`