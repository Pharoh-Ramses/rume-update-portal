import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPatientDashboardData, logPatientAction } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated session
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all dashboard data using the existing optimized query
    const dashboardData = await getPatientDashboardData(session.user.id);

    if (!dashboardData.patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Debug logging for insurance data
    console.log('🔍 Dashboard Debug - Patient ID:', session.user.id);
    console.log('🔍 Dashboard Debug - Insurance Card:', dashboardData.insuranceCard ? 'Found' : 'Not found');
    if (dashboardData.insuranceCard) {
      console.log('🔍 Insurance Details:', {
        id: dashboardData.insuranceCard.id,
        company: dashboardData.insuranceCard.insuranceCompany,
        isActive: dashboardData.insuranceCard.isActive
      });
    }

    // Calculate summary statistics
    const services = dashboardData.services || [];
    const summary = {
      servicesTotal: services.length,
      servicesPaid: services.filter(s => s.isPaid).length,
      servicesUnpaid: services.filter(s => !s.isPaid).length,
      hasInsurance: !!dashboardData.insuranceCard,
      hasActiveInsurance: !!(dashboardData.insuranceCard?.isActive),
      insuranceNeedsReview: !!(dashboardData.insuranceCard && !dashboardData.insuranceCard.isActive),
      totalOriginalAmount: services.reduce((sum, s) => sum + parseFloat(s.originalAmount), 0),
      totalDiscountedAmount: services.reduce((sum, s) => sum + parseFloat(s.discountedAmount), 0)
    };

    // Log the action
    const userAgent = request.headers.get('user-agent') || undefined;
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : 
                     request.headers.get('x-real-ip') || 
                     undefined;

    await logPatientAction(
      session.user.id,
      'view_dashboard',
      JSON.stringify({ 
        servicesCount: services.length,
        hasInsurance: !!dashboardData.insuranceCard,
        unpaidServices: summary.servicesUnpaid
      }),
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      patient: {
        id: dashboardData.patient.id,
        email: dashboardData.patient.email,
        firstName: dashboardData.patient.firstName,
        lastName: dashboardData.patient.lastName,
        phone: dashboardData.patient.phone,
        dateOfBirth: dashboardData.patient.dateOfBirth
      },
      services: dashboardData.services,
      insuranceCard: dashboardData.insuranceCard,
      summary
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}