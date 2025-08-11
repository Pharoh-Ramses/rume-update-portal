'use client';

import { useState } from 'react';
import { InsuranceCard } from '@/lib/db/schema';
import { Upload, X, Check, AlertCircle, CreditCard, Building } from 'lucide-react';

interface InsurancePanelProps {
  insuranceCard: InsuranceCard | null;
  loading?: boolean;
  onUpdate?: () => void;
}

interface InsuranceFormData {
  insuranceCompany: string;
  policyNumber: string;
  groupNumber: string;
  memberName: string;
  memberId: string;
}

interface UploadedFile {
  file: File;
  preview: string;
  side: 'front' | 'back';
}

export default function InsurancePanel({ 
  insuranceCard, 
  loading = false,
  onUpdate 
}: InsurancePanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<InsuranceFormData>({
    insuranceCompany: insuranceCard?.insuranceCompany || '',
    policyNumber: insuranceCard?.policyNumber || '',
    groupNumber: insuranceCard?.groupNumber || '',
    memberName: insuranceCard?.memberName || '',
    memberId: insuranceCard?.memberId || ''
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (field: keyof InsuranceFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (files: FileList | null, side: 'front' | 'back') => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > maxSize) {
      alert('File too large. Please upload an image smaller than 10MB.');
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);
    
    // Remove existing file for this side
    setUploadedFiles(prev => prev.filter(f => f.side !== side));
    
    // Add new file
    setUploadedFiles(prev => [...prev, { file, preview, side }]);
  };

  const removeFile = (side: 'front' | 'back') => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.side === side);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.side !== side);
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Create FormData for file uploads
      const submitFormData = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value.trim()) {
          submitFormData.append(key, value.trim());
        }
      });

      // Add files
      uploadedFiles.forEach(({ file, side }) => {
        submitFormData.append(`${side}Image`, file);
      });

      // Determine update type
      const hasFiles = uploadedFiles.length > 0;
      const hasFormData = Object.values(formData).some(value => value.trim());
      
      let updateType = 'manual_entry';
      if (hasFiles && hasFormData) {
        updateType = 'both';
      } else if (hasFiles) {
        updateType = 'photo_upload';
      }
      
      submitFormData.append('updateType', updateType);

      const response = await fetch('/api/patient/insurance/update', {
        method: 'POST',
        body: submitFormData,
      });

      if (response.ok) {
        setSubmitStatus('success');
        setIsEditing(false);
        
        // Clean up file previews
        uploadedFiles.forEach(({ preview }) => {
          URL.revokeObjectURL(preview);
        });
        setUploadedFiles([]);
        
        // Refresh dashboard data
        if (onUpdate) {
          onUpdate();
        }
      } else {
        const error = await response.json();
        console.error('Insurance update failed:', error);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Insurance update error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      insuranceCompany: insuranceCard?.insuranceCompany || '',
      policyNumber: insuranceCard?.policyNumber || '',
      groupNumber: insuranceCard?.groupNumber || '',
      memberName: insuranceCard?.memberName || '',
      memberId: insuranceCard?.memberId || ''
    });
    
    // Clean up file previews
    uploadedFiles.forEach(({ preview }) => {
      URL.revokeObjectURL(preview);
    });
    setUploadedFiles([]);
    setSubmitStatus('idle');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center mb-4">
            <div className="h-5 w-5 bg-gray-200 rounded mr-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Insurance Information</h3>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {insuranceCard ? 'Update' : 'Add Insurance'}
          </button>
        )}
      </div>

      {/* Success/Error Messages */}
      {submitStatus === 'success' && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <Check className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-sm text-green-800">
              Insurance information updated successfully! We&apos;ll resubmit your claims.
            </span>
          </div>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <span className="text-sm text-red-800">
              Failed to update insurance information. Please try again.
            </span>
          </div>
        </div>
      )}

      {!isEditing ? (
        /* Display Mode */
        <div>
          {insuranceCard ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <Building className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="font-medium text-gray-900">
                    {insuranceCard.insuranceCompany}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    insuranceCard.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {insuranceCard.isActive ? 'Active' : 'Needs Review'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="font-medium w-20">Policy:</span>
                  <span>{insuranceCard.policyNumber}</span>
                </div>
                {insuranceCard.groupNumber && (
                  <div className="flex items-center">
                    <span className="font-medium w-20">Group:</span>
                    <span>{insuranceCard.groupNumber}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <span className="font-medium w-20">Member:</span>
                  <span>{insuranceCard.memberName}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-20">ID:</span>
                  <span>{insuranceCard.memberId}</span>
                </div>
              </div>

              {!insuranceCard.isActive && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    <strong>Action Needed:</strong> This insurance information needs review. 
                    Please update it to ensure your claims can be processed.
                  </p>
                </div>
              )}

              {(insuranceCard.frontImageUrl || insuranceCard.backImageUrl) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Insurance Card Images</p>
                  <div className="flex space-x-2">
                    {insuranceCard.frontImageUrl && (
                      <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                        Front ✓
                      </div>
                    )}
                    {insuranceCard.backImageUrl && (
                      <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                        Back ✓
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <CreditCard className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-4">
                No insurance information on file. Add your insurance to potentially get your claims covered instead of paying out of pocket.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Edit Mode */
        <div className="space-y-6">
          {/* Manual Entry Form */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Insurance Details</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance Company *
                </label>
                <input
                  type="text"
                  value={formData.insuranceCompany}
                  onChange={(e) => handleInputChange('insuranceCompany', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Blue Cross Blue Shield"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Policy Number *
                  </label>
                  <input
                    type="text"
                    value={formData.policyNumber}
                    onChange={(e) => handleInputChange('policyNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Number
                  </label>
                  <input
                    type="text"
                    value={formData.groupNumber}
                    onChange={(e) => handleInputChange('groupNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member Name *
                  </label>
                  <input
                    type="text"
                    value={formData.memberName}
                    onChange={(e) => handleInputChange('memberName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member ID *
                  </label>
                  <input
                    type="text"
                    value={formData.memberId}
                    onChange={(e) => handleInputChange('memberId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Insurance Card Photos</h4>
            <p className="text-xs text-gray-600 mb-4">
              Upload photos of both sides of your insurance card for faster processing.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Front Upload */}
              <FileUploadArea
                side="front"
                uploadedFile={uploadedFiles.find(f => f.side === 'front')}
                onFileUpload={handleFileUpload}
                onRemoveFile={removeFile}
              />
              
              {/* Back Upload */}
              <FileUploadArea
                side="back"
                uploadedFile={uploadedFiles.find(f => f.side === 'back')}
                onFileUpload={handleFileUpload}
                onRemoveFile={removeFile}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              {isSubmitting ? 'Updating...' : 'Update Insurance'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface FileUploadAreaProps {
  side: 'front' | 'back';
  uploadedFile?: UploadedFile;
  onFileUpload: (files: FileList | null, side: 'front' | 'back') => void;
  onRemoveFile: (side: 'front' | 'back') => void;
}

function FileUploadArea({ side, uploadedFile, onFileUpload, onRemoveFile }: FileUploadAreaProps) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onFileUpload(e.dataTransfer.files, side);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 capitalize">
        {side} of Card
      </label>
      
      {uploadedFile ? (
        <div className="relative">
          <img
            src={uploadedFile.preview}
            alt={`Insurance card ${side}`}
            className="w-full h-32 object-cover rounded-lg border border-gray-300"
          />
          <button
            onClick={() => onRemoveFile(side)}
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer"
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFileUpload(e.target.files, side)}
            className="hidden"
            id={`${side}-upload`}
          />
          <label htmlFor={`${side}-upload`} className="cursor-pointer">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Drop image here or click to upload
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPEG, PNG, WebP up to 10MB
            </p>
          </label>
        </div>
      )}
    </div>
  );
}