import { pgTable, text, timestamp, decimal, boolean, uuid, integer } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const patients = pgTable('patients', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  phone: text('phone'),
  dateOfBirth: text('date_of_birth'),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const services = pgTable('services', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  patientId: text('patient_id').references(() => patients.id).notNull(),
  serviceCode: text('service_code').notNull(),
  serviceName: text('service_name').notNull(),
  serviceDate: timestamp('service_date').notNull(),
  originalAmount: decimal('original_amount', { precision: 10, scale: 2 }).notNull(),
  discountedAmount: decimal('discounted_amount', { precision: 10, scale: 2 }).notNull(),
  insuranceDenialReason: text('insurance_denial_reason'),
  insuranceCompanyPhone: text('insurance_company_phone'),
  isPaid: boolean('is_paid').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const magicLinks = pgTable('magic_links', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  token: text('token').notNull().unique(),
  patientId: text('patient_id').references(() => patients.id).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false).notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const insuranceCards = pgTable('insurance_cards', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  patientId: text('patient_id').references(() => patients.id).notNull(),
  frontImageUrl: text('front_image_url'),
  backImageUrl: text('back_image_url'),
  insuranceCompany: text('insurance_company'),
  policyNumber: text('policy_number'),
  groupNumber: text('group_number'),
  memberName: text('member_name'),
  memberId: text('member_id'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insuranceUpdates = pgTable('insurance_updates', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  patientId: text('patient_id').references(() => patients.id).notNull(),
  insuranceCardId: text('insurance_card_id').references(() => insuranceCards.id),
  updateType: text('update_type').notNull(), // 'photo_upload', 'manual_entry', 'both'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const payments = pgTable('payments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  patientId: text('patient_id').references(() => patients.id).notNull(),
  stripePaymentIntentId: text('stripe_payment_intent_id').unique(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('usd').notNull(),
  status: text('status').notNull(), // 'pending', 'succeeded', 'failed', 'canceled'
  serviceIds: text('service_ids').array(), // Array of service IDs that were paid for
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const patientActions = pgTable('patient_actions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  patientId: text('patient_id').references(() => patients.id).notNull(),
  action: text('action').notNull(), // 'login', 'view_dashboard', 'update_insurance', 'make_payment', etc.
  details: text('details'), // JSON string with additional details
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Types for TypeScript
export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type MagicLink = typeof magicLinks.$inferSelect;
export type NewMagicLink = typeof magicLinks.$inferInsert;
export type InsuranceCard = typeof insuranceCards.$inferSelect;
export type NewInsuranceCard = typeof insuranceCards.$inferInsert;
export type InsuranceUpdate = typeof insuranceUpdates.$inferSelect;
export type NewInsuranceUpdate = typeof insuranceUpdates.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type PatientAction = typeof patientActions.$inferSelect;
export type NewPatientAction = typeof patientActions.$inferInsert;