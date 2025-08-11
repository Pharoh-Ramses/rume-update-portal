'use client';

import { useState, useEffect, useMemo } from 'react';
import { Service } from '@/lib/db/schema';
import { Check, AlertCircle, Phone, Calendar, DollarSign } from 'lucide-react';

interface ServicesTableProps {
  services: Service[];
  onSelectionChange?: (selectedServices: Service[], totals: ServiceTotals) => void;
  loading?: boolean;
}

interface ServiceTotals {
  originalTotal: number;
  discountedTotal: number;
  savings: number;
  savingsPercentage: number;
  selectedCount: number;
}

export default function ServicesTable({ 
  services, 
  onSelectionChange,
  loading = false 
}: ServicesTableProps) {
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Calculate totals for display (memoized to prevent infinite loops)
  const totals = useMemo(() => calculateTotals(services, selectedServices), [services, selectedServices]);

  useEffect(() => {
    if (onSelectionChange) {
      const selectedServiceObjects = services.filter(service => 
        selectedServices.has(service.id)
      );
      const calculatedTotals = calculateTotals(services, selectedServices);
      onSelectionChange(selectedServiceObjects, calculatedTotals);
    }
  }, [selectedServices, services, onSelectionChange]);

  const handleSelectAll = () => {
    const unpaidServices = services.filter(service => !service.isPaid);
    if (selectedServices.size === unpaidServices.length) {
      setSelectedServices(new Set());
    } else {
      setSelectedServices(new Set(unpaidServices.map(service => service.id)));
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId);
    } else {
      newSelected.add(serviceId);
    }
    setSelectedServices(newSelected);
  };

  const toggleRowExpansion = (serviceId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(serviceId)) {
      newExpanded.delete(serviceId);
    } else {
      newExpanded.add(serviceId);
    }
    setExpandedRows(newExpanded);
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numAmount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  const unpaidServices = services.filter(service => !service.isPaid);
  const paidServices = services.filter(service => service.isPaid);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
            <DollarSign className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Found</h3>
          <p className="text-gray-600">
            We couldn&apos;t find any medical services associated with your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Medical Services</h2>
            <p className="mt-1 text-sm text-gray-600">
              {services.length} total services • {unpaidServices.length} unpaid • {paidServices.length} paid
            </p>
          </div>
          
          {unpaidServices.length > 0 && (
            <div className="mt-4 sm:mt-0">
              <button
                onClick={handleSelectAll}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {selectedServices.size === unpaidServices.length ? 'Deselect All' : 'Select All Unpaid'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Services List */}
      <div className="divide-y divide-gray-200">
        {services.map((service) => (
          <ServiceRow
            key={service.id}
            service={service}
            isSelected={selectedServices.has(service.id)}
            isExpanded={expandedRows.has(service.id)}
            onToggleSelect={() => handleServiceToggle(service.id)}
            onToggleExpand={() => toggleRowExpansion(service.id)}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        ))}
      </div>

      {/* Totals Footer */}
      {selectedServices.size > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-600">
              {totals.selectedCount} service{totals.selectedCount !== 1 ? 's' : ''} selected
            </div>
            <div className="mt-2 sm:mt-0 text-right">
              <div className="text-sm text-gray-600">
                Original Total: <span className="line-through">{formatCurrency(totals.originalTotal)}</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                Your Price: {formatCurrency(totals.discountedTotal)}
              </div>
              <div className="text-sm text-green-600 font-medium">
                You Save: {formatCurrency(totals.savings)} ({totals.savingsPercentage}% off)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ServiceRowProps {
  service: Service;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleSelect: () => void;
  onToggleExpand: () => void;
  formatCurrency: (amount: string | number) => string;
  formatDate: (date: Date) => string;
}

function ServiceRow({
  service,
  isSelected,
  isExpanded,
  onToggleSelect,
  onToggleExpand,
  formatCurrency,
  formatDate
}: ServiceRowProps) {
  const hasDetails = service.insuranceDenialReason || service.insuranceCompanyPhone;
  
  return (
    <div className="px-6 py-4">
      <div className="flex items-start space-x-4">
        {/* Checkbox */}
        <div className="flex-shrink-0 pt-1">
          {service.isPaid ? (
            <div className="flex items-center justify-center w-5 h-5 bg-green-100 rounded">
              <Check className="w-3 h-3 text-green-600" />
            </div>
          ) : (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          )}
        </div>

        {/* Service Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-medium text-gray-900">
                  {service.serviceName}
                </h3>
                {service.isPaid && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Paid
                  </span>
                )}
              </div>
              
              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(service.serviceDate)}
                </div>
                <div>Code: {service.serviceCode}</div>
              </div>

              {hasDetails && (
                <button
                  onClick={onToggleExpand}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {isExpanded ? 'Hide Details' : 'Show Insurance Details'}
                </button>
              )}
            </div>

            {/* Pricing */}
            <div className="mt-2 sm:mt-0 sm:ml-4 text-right">
              <div className="text-sm text-gray-500 line-through">
                {formatCurrency(service.originalAmount)}
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(service.discountedAmount)}
              </div>
              <div className="text-sm text-green-600 font-medium">
                {Math.round((1 - parseFloat(service.discountedAmount) / parseFloat(service.originalAmount)) * 100)}% off
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          {isExpanded && hasDetails && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              {service.insuranceDenialReason && (
                <div className="flex items-start space-x-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Insurance Denial Reason</h4>
                    <p className="mt-1 text-sm text-yellow-700">{service.insuranceDenialReason}</p>
                  </div>
                </div>
              )}
              
              {service.insuranceCompanyPhone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-yellow-600" />
                  <div>
                    <span className="text-sm font-medium text-yellow-800">Insurance Company: </span>
                    <a 
                      href={`tel:${service.insuranceCompanyPhone}`}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      {service.insuranceCompanyPhone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function calculateTotals(services: Service[], selectedIds: Set<string>): ServiceTotals {
  const selectedServices = services.filter(service => selectedIds.has(service.id));
  
  const originalTotal = selectedServices.reduce((sum, service) => 
    sum + parseFloat(service.originalAmount), 0
  );
  
  const discountedTotal = selectedServices.reduce((sum, service) => 
    sum + parseFloat(service.discountedAmount), 0
  );
  
  const savings = originalTotal - discountedTotal;
  const savingsPercentage = originalTotal > 0 ? Math.round((savings / originalTotal) * 100) : 0;
  
  return {
    originalTotal,
    discountedTotal,
    savings,
    savingsPercentage,
    selectedCount: selectedServices.length
  };
}