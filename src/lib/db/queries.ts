import { db } from './index';
import { patients, services, insuranceCards, magicLinks, payments, patientActions } from './schema';
import { eq, and, desc } from 'drizzle-orm';
import type { Patient, Service, InsuranceCard, MagicLink } from './schema';

// Patient queries
export async function getPatientByEmail(email: string): Promise<Patient | null> {
  const result = await db.select().from(patients).where(eq(patients.email, email)).limit(1);
  return result[0] || null;
}

export async function getPatientById(id: string): Promise<Patient | null> {
  const result = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
  return result[0] || null;
}

export async function createPatient(patientData: Omit<typeof patients.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>) {
  const result = await db.insert(patients).values(patientData).returning();
  return result[0];
}

export async function updatePatientPassword(patientId: string, passwordHash: string) {
  const result = await db
    .update(patients)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(patients.id, patientId))
    .returning();
  return result[0];
}

// Magic link queries
export async function createMagicLink(linkData: Omit<typeof magicLinks.$inferInsert, 'id' | 'createdAt'>) {
  const result = await db.insert(magicLinks).values(linkData).returning();
  return result[0];
}

export async function getMagicLinkByToken(token: string): Promise<MagicLink | null> {
  const result = await db.select().from(magicLinks).where(eq(magicLinks.token, token)).limit(1);
  return result[0] || null;
}

export async function markMagicLinkAsUsed(token: string) {
  const result = await db
    .update(magicLinks)
    .set({ used: true, usedAt: new Date() })
    .where(eq(magicLinks.token, token))
    .returning();
  return result[0];
}

// Service queries
export async function getServicesByPatientId(patientId: string): Promise<Service[]> {
  return await db
    .select()
    .from(services)
    .where(eq(services.patientId, patientId))
    .orderBy(desc(services.serviceDate));
}

export async function getServiceById(id: string): Promise<Service | null> {
  const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return result[0] || null;
}

export async function markServicesAsPaid(serviceIds: string[], paymentId: string) {
  return await db
    .update(services)
    .set({ isPaid: true, updatedAt: new Date() })
    .where(eq(services.id, serviceIds[0])); // This would need to be updated for multiple IDs
}

// Insurance card queries
export async function getInsuranceCardByPatientId(patientId: string): Promise<InsuranceCard | null> {
  const result = await db
    .select()
    .from(insuranceCards)
    .where(and(eq(insuranceCards.patientId, patientId), eq(insuranceCards.isActive, true)))
    .limit(1);
  return result[0] || null;
}

export async function createInsuranceCard(cardData: Omit<typeof insuranceCards.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>) {
  // Deactivate existing cards
  await db
    .update(insuranceCards)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(insuranceCards.patientId, cardData.patientId));

  // Insert new card
  const result = await db.insert(insuranceCards).values(cardData).returning();
  return result[0];
}

export async function updateInsuranceCardImages(cardId: string, frontImageUrl?: string, backImageUrl?: string) {
  const updateData: any = { updatedAt: new Date() };
  if (frontImageUrl) updateData.frontImageUrl = frontImageUrl;
  if (backImageUrl) updateData.backImageUrl = backImageUrl;

  const result = await db
    .update(insuranceCards)
    .set(updateData)
    .where(eq(insuranceCards.id, cardId))
    .returning();
  return result[0];
}

// Payment queries
export async function createPayment(paymentData: Omit<typeof payments.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>) {
  const result = await db.insert(payments).values(paymentData).returning();
  return result[0];
}

export async function updatePaymentStatus(paymentIntentId: string, status: string) {
  const result = await db
    .update(payments)
    .set({ status, updatedAt: new Date() })
    .where(eq(payments.stripePaymentIntentId, paymentIntentId))
    .returning();
  return result[0];
}

// Patient action logging
export async function logPatientAction(
  patientId: string,
  action: string,
  details?: string,
  ipAddress?: string,
  userAgent?: string
) {
  await db.insert(patientActions).values({
    patientId,
    action,
    details,
    ipAddress,
    userAgent,
  });
}

// Dashboard data query
export async function getPatientDashboardData(patientId: string) {
  const [patient, patientServices, insuranceCard] = await Promise.all([
    getPatientById(patientId),
    getServicesByPatientId(patientId),
    getInsuranceCardByPatientId(patientId),
  ]);

  return {
    patient,
    services: patientServices,
    insuranceCard,
  };
}