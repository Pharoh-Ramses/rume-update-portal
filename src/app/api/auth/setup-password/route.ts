import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updatePatientPassword, logPatientAction } from '@/lib/db/queries';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const setupPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = setupPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { password } = validation.data;

    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Update patient password
    await updatePatientPassword(session.user.id, passwordHash);

    // Log the action
    await logPatientAction(
      session.user.id,
      'password_setup',
      'Password successfully set up'
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Password setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}