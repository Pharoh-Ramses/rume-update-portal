'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ServicesTable from '@/components/dashboard/services-table';
import InsurancePanel from '@/components/dashboard/insurance-panel';
import { Service, InsuranceCard, Patient } from '@/lib/db/schema';

interface ServiceTotals {
  originalTotal: number;
  discountedTotal: number;
  savings: number;
  savingsPercentage: number;
  selectedCount: number;
}

interface DashboardData {
  patient: Patient;
  services: Service[];
  insuranceCard: InsuranceCard | null;
  summary: {
    servicesTotal: number;
    servicesPaid: number;
    servicesUnpaid: number;
    hasInsurance: boolean;
    hasActiveInsurance: boolean;
    insuranceNeedsReview: boolean;
    totalOriginalAmount: number;
    totalDiscountedAmount: number;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedTotals, setSelectedTotals] = useState<ServiceTotals>({
    originalTotal: 0,
    discountedTotal: 0,
    savings: 0,
    savingsPercentage: 0,
    selectedCount: 0
  });

  // Fetch dashboard data when component mounts and user is authenticated
  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session?.user?.id]);

  const fetchDashboardData = async () => {
    try {
      setDashboardLoading(true);
      const response = await fetch('/api/patient/dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  const handleSelectionChange = (selected: Service[], totals: ServiceTotals) => {
    setSelectedServices(selected);
    setSelectedTotals(totals);
  };

  if (status === 'loading') {
    return (
      <div className="bg-gray-50 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900">
                Insurance & Payment Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Welcome back, {session?.user?.name}. 
                {dashboardData?.summary && (
                  <span className="block mt-1">
                    You have {dashboardData.summary.servicesUnpaid} unpaid service{dashboardData.summary.servicesUnpaid !== 1 ? 's' : ''} 
                    {dashboardData.summary.hasActiveInsurance 
                      ? ' and active insurance on file' 
                      : dashboardData.summary.insuranceNeedsReview 
                        ? ' and insurance that needs review'
                        : ' with no insurance on file'
                    }.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Password Setup Alert */}
        {session?.user?.needsPasswordSetup && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-yellow-800">
                  Action Required: Set Up Your Password
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Please create a password for future logins to keep your account secure.
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/auth/setup-password')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Set Up Password Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <ServicesTable 
              services={dashboardData?.services || []}
              loading={dashboardLoading}
              onSelectionChange={handleSelectionChange}
            />
            
            {/* Action Buttons */}
            {selectedServices.length > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Pay Selected Services ({selectedTotals.selectedCount})
                </button>
                <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Update Insurance Instead
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Insurance Panel */}
            <InsurancePanel
              insuranceCard={dashboardData?.insuranceCard || null}
              loading={dashboardLoading}
              onUpdate={fetchDashboardData}
            />

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                  Download Payment Receipt
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                  Contact Billing Support
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                  View Payment History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}