import { db } from '../index';
import { patients, services, insuranceCards, magicLinks } from '../schema';
import { calculateDiscountedAmount } from '@/constants/pricing';
import { createId } from '@paralleldrive/cuid2';

const samplePatients = [
  {
    id: createId(),
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '(555) 123-4567',
    dateOfBirth: '1985-03-15',
    passwordHash: null, // Will be set when they create password
  },
  {
    id: createId(),
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '(555) 987-6543',
    dateOfBirth: '1990-07-22',
    passwordHash: null,
  },
  {
    id: createId(),
    email: 'mike.johnson@example.com',
    firstName: 'Mike',
    lastName: 'Johnson',
    phone: '(555) 456-7890',
    dateOfBirth: '1978-11-08',
    passwordHash: null,
  },
];

const sampleServices = [
  // John Doe's services
  {
    id: createId(),
    patientId: samplePatients[0].id,
    serviceCode: 'office_visit',
    serviceName: 'Annual Physical Examination',
    serviceDate: new Date('2024-01-15'),
    originalAmount: '250.00',
    discountedAmount: calculateDiscountedAmount(250, 'office_visit').toString(),
    insuranceDenialReason: 'Prior authorization required but not obtained',
    insuranceCompanyPhone: '1-800-555-BLUE',
    isPaid: false,
  },
  {
    id: createId(),
    patientId: samplePatients[0].id,
    serviceCode: 'lab_work',
    serviceName: 'Complete Blood Count (CBC)',
    serviceDate: new Date('2024-01-15'),
    originalAmount: '85.00',
    discountedAmount: calculateDiscountedAmount(85, 'lab_work').toString(),
    insuranceDenialReason: 'Not medically necessary per insurance guidelines',
    insuranceCompanyPhone: '1-800-555-BLUE',
    isPaid: false,
  },
  // Jane Smith's services
  {
    id: createId(),
    patientId: samplePatients[1].id,
    serviceCode: 'imaging',
    serviceName: 'Chest X-Ray',
    serviceDate: new Date('2024-02-03'),
    originalAmount: '180.00',
    discountedAmount: calculateDiscountedAmount(180, 'imaging').toString(),
    insuranceDenialReason: 'Deductible not met - patient responsibility',
    insuranceCompanyPhone: '1-800-555-AETNA',
    isPaid: false,
  },
  {
    id: createId(),
    patientId: samplePatients[1].id,
    serviceCode: 'consultation',
    serviceName: 'Specialist Consultation - Cardiology',
    serviceDate: new Date('2024-02-10'),
    originalAmount: '350.00',
    discountedAmount: calculateDiscountedAmount(350, 'consultation').toString(),
    insuranceDenialReason: 'Referral expired - new referral required',
    insuranceCompanyPhone: '1-800-555-AETNA',
    isPaid: false,
  },
  // Mike Johnson's services
  {
    id: createId(),
    patientId: samplePatients[2].id,
    serviceCode: 'procedure',
    serviceName: 'Minor Surgical Procedure',
    serviceDate: new Date('2024-01-28'),
    originalAmount: '750.00',
    discountedAmount: calculateDiscountedAmount(750, 'procedure').toString(),
    insuranceDenialReason: 'Procedure code not covered under current plan',
    insuranceCompanyPhone: '1-800-555-UNITED',
    isPaid: false,
  },
];

const sampleInsuranceCards = [
  {
    id: createId(),
    patientId: samplePatients[0].id,
    frontImageUrl: null, // Will be populated when they upload
    backImageUrl: null,
    insuranceCompany: 'Blue Cross Blue Shield',
    policyNumber: 'BC123456789',
    groupNumber: 'GRP001',
    memberName: 'John Doe',
    memberId: 'JD123456',
    isActive: true,
  },
  {
    id: createId(),
    patientId: samplePatients[1].id,
    frontImageUrl: null,
    backImageUrl: null,
    insuranceCompany: 'Aetna',
    policyNumber: 'AET987654321',
    groupNumber: 'GRP002',
    memberName: 'Jane Smith',
    memberId: 'JS987654',
    isActive: true,
  },
  {
    id: createId(),
    patientId: samplePatients[2].id,
    frontImageUrl: null,
    backImageUrl: null,
    insuranceCompany: 'United Healthcare',
    policyNumber: 'UHC456789123',
    groupNumber: 'GRP003',
    memberName: 'Mike Johnson',
    memberId: 'MJ456789',
    isActive: true,
  },
];

// Generate magic links for each patient (valid for 24 hours)
const sampleMagicLinks = samplePatients.map(patient => ({
  id: createId(),
  token: createId(), // Using CUID as token
  patientId: patient.id,
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
  used: false,
  usedAt: null,
}));

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');

    // Insert patients
    console.log('👥 Inserting patients...');
    await db.insert(patients).values(samplePatients);

    // Insert insurance cards
    console.log('💳 Inserting insurance cards...');
    await db.insert(insuranceCards).values(sampleInsuranceCards);

    // Insert services
    console.log('🏥 Inserting services...');
    await db.insert(services).values(sampleServices);

    // Insert magic links
    console.log('🔗 Inserting magic links...');
    await db.insert(magicLinks).values(sampleMagicLinks);

    console.log('✅ Database seeded successfully!');
    console.log('\n📧 Sample magic link URLs:');
    sampleMagicLinks.forEach((link, index) => {
      console.log(`${samplePatients[index].email}: http://localhost:3001/auth/magic?token=${link.token}`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}