import { db } from './index';
import { patients } from './schema';
import { eq } from 'drizzle-orm';

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Try a simple query
    const result = await db.select().from(patients).limit(1);
    
    console.log('✅ Database connection successful!');
    console.log(`📊 Found ${result.length} patients in database`);
    
    if (result.length > 0) {
      console.log(`👤 Sample patient: ${result[0].firstName} ${result[0].lastName} (${result[0].email})`);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

if (require.main === module) {
  testConnection()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { testConnection };