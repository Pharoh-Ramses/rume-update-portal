import { NextRequest, NextResponse } from 'next/server';
import { getMagicLinkByToken, getPatientById } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 400 });
  }

  try {
    console.log('Testing magic link token:', token);
    
    // Test database connection and magic link lookup
    const magicLink = await getMagicLinkByToken(token);
    console.log('Magic link found:', magicLink);

    if (!magicLink) {
      return NextResponse.json({ 
        error: 'Magic link not found',
        token,
        found: false 
      });
    }

    // Test patient lookup
    const patient = await getPatientById(magicLink.patientId);
    console.log('Patient found:', patient);

    return NextResponse.json({
      success: true,
      magicLink: {
        id: magicLink.id,
        token: magicLink.token,
        patientId: magicLink.patientId,
        expiresAt: magicLink.expiresAt,
        used: magicLink.used,
        usedAt: magicLink.usedAt,
      },
      patient: patient ? {
        id: patient.id,
        email: patient.email,
        firstName: patient.firstName,
        lastName: patient.lastName,
        hasPassword: !!patient.passwordHash,
      } : null,
      checks: {
        tokenExists: !!magicLink,
        patientExists: !!patient,
        isExpired: new Date() > magicLink.expiresAt,
        isUsed: magicLink.used,
      }
    });

  } catch (error) {
    console.error('Magic link test error:', error);
    return NextResponse.json({ 
      error: 'Database error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}