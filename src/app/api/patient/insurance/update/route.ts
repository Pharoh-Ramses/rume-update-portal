import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createInsuranceCard, createInsuranceUpdate, logPatientAction } from '@/lib/db/queries';
import { uploadFile, generateInsuranceCardKey, getFileExtension, validateImageFile } from '@/lib/storage/s3';
import { uploadFileLocally, isS3Configured } from '@/lib/storage/local-fallback';

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated session
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    
    // Extract form fields
    const insuranceCompany = formData.get('insuranceCompany') as string;
    const policyNumber = formData.get('policyNumber') as string;
    const groupNumber = formData.get('groupNumber') as string;
    const memberName = formData.get('memberName') as string;
    const memberId = formData.get('memberId') as string;
    const updateType = formData.get('updateType') as string;

    // Extract files
    const frontImage = formData.get('frontImage') as File | null;
    const backImage = formData.get('backImage') as File | null;

    // Validate required fields for manual entry
    const hasManualData = insuranceCompany || policyNumber || memberName || memberId;
    const hasFiles = frontImage || backImage;

    if (!hasManualData && !hasFiles) {
      return NextResponse.json(
        { error: 'Please provide either insurance details or upload card images' },
        { status: 400 }
      );
    }

    let frontImageUrl: string | undefined;
    let backImageUrl: string | undefined;

    // Handle file uploads
    if (frontImage) {
      const validation = validateImageFile(frontImage);
      if (!validation.valid) {
        return NextResponse.json(
          { error: `Front image: ${validation.error}` },
          { status: 400 }
        );
      }

      const extension = getFileExtension(frontImage.name);
      const key = generateInsuranceCardKey(session.user.id, 'front', extension);
      const buffer = Buffer.from(await frontImage.arrayBuffer());
      
      const uploadResult = isS3Configured() 
        ? await uploadFile(buffer, key, frontImage.type)
        : await uploadFileLocally(buffer, key, frontImage.type);
      frontImageUrl = uploadResult.url;
    }

    if (backImage) {
      const validation = validateImageFile(backImage);
      if (!validation.valid) {
        return NextResponse.json(
          { error: `Back image: ${validation.error}` },
          { status: 400 }
        );
      }

      const extension = getFileExtension(backImage.name);
      const key = generateInsuranceCardKey(session.user.id, 'back', extension);
      const buffer = Buffer.from(await backImage.arrayBuffer());
      
      const uploadResult = isS3Configured() 
        ? await uploadFile(buffer, key, backImage.type)
        : await uploadFileLocally(buffer, key, backImage.type);
      backImageUrl = uploadResult.url;
    }

    // Create new insurance card record
    const insuranceCardData = {
      patientId: session.user.id,
      frontImageUrl,
      backImageUrl,
      insuranceCompany: insuranceCompany || undefined,
      policyNumber: policyNumber || undefined,
      groupNumber: groupNumber || undefined,
      memberName: memberName || undefined,
      memberId: memberId || undefined,
    };

    const newInsuranceCard = await createInsuranceCard(insuranceCardData);

    // Create insurance update record for tracking
    await createInsuranceUpdate({
      patientId: session.user.id,
      insuranceCardId: newInsuranceCard.id,
      updateType: updateType || 'manual_entry',
      notes: `Updated via patient portal. ${hasFiles ? 'Includes uploaded images.' : 'Manual entry only.'}`
    });

    // Log the action
    const userAgent = request.headers.get('user-agent') || undefined;
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : 
                     request.headers.get('x-real-ip') || 
                     undefined;

    await logPatientAction(
      session.user.id,
      'insurance_update',
      JSON.stringify({
        updateType,
        hasFiles: !!hasFiles,
        hasManualData: !!hasManualData,
        insuranceCompany: insuranceCompany || 'Not provided'
      }),
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      success: true,
      message: 'Insurance information updated successfully',
      insuranceCard: newInsuranceCard
    });

  } catch (error) {
    console.error('Error updating insurance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}