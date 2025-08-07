import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function simpleTest() {
  const connectionString = process.env.DATABASE_URL!;
  console.log('🔍 Testing simple connection...');
  console.log('Connection string format:', connectionString.replace(/:[^:@]*@/, ':***@'));
  
  try {
    const sql = postgres(connectionString);
    const result = await sql`SELECT version()`;
    console.log('✅ Database connection successful!');
    console.log('📊 PostgreSQL version:', result[0].version);
    await sql.end();
  } catch (error) {
    console.error('❌ Simple connection failed:', error);
    throw error;
  }
}

if (require.main === module) {
  simpleTest()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}