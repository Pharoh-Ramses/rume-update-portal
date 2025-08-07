'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

function MagicLinkContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired' | 'used'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid magic link - no token provided');
      return;
    }

    const handleMagicLink = async () => {
      try {
        console.log('🔍 Starting magic link sign in with token:', token);
        
        const result = await signIn('magic-link', {
          token,
          redirect: false,
        });

        console.log('🔍 SignIn result:', result);

        if (result?.error) {
          console.log('❌ SignIn error:', result.error);
          if (result.error.includes('expired')) {
            setStatus('expired');
            setMessage('This magic link has expired. Please request a new one.');
          } else if (result.error.includes('used')) {
            setStatus('used');
            setMessage('This magic link has already been used. Please request a new one.');
          } else {
            setStatus('error');
            setMessage(`Invalid magic link: ${result.error}`);
          }
        } else if (result?.ok) {
          console.log('✅ SignIn successful');
          setStatus('success');
          setMessage('Successfully signed in! Redirecting to your dashboard...');
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          console.log('❓ Unexpected result:', result);
          setStatus('error');
          setMessage('Unexpected response from authentication system.');
        }
      } catch (error) {
        console.error('❌ Magic link error:', error);
        setStatus('error');
        setMessage('An error occurred while processing your magic link.');
      }
    };

    handleMagicLink();
  }, [searchParams, router]);

  const getStatusColor = () => {
    switch (status) {
      case 'loading': return 'text-blue-600';
      case 'success': return 'text-green-600';
      case 'error':
      case 'expired':
      case 'used': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading': return '⏳';
      case 'success': return '✅';
      case 'error':
      case 'expired':
      case 'used': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Processing Magic Link
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we verify your access...
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <div className="text-center">
            <div className="text-6xl mb-4">
              {getStatusIcon()}
            </div>
            
            <h3 className={`text-lg font-medium ${getStatusColor()}`}>
              {status === 'loading' && 'Verifying your magic link...'}
              {status === 'success' && 'Welcome back!'}
              {status === 'error' && 'Link Invalid'}
              {status === 'expired' && 'Link Expired'}
              {status === 'used' && 'Link Already Used'}
            </h3>
            
            <p className="mt-2 text-sm text-gray-600">
              {message}
            </p>
            
            {(status === 'error' || status === 'expired' || status === 'used') && (
              <div className="mt-6">
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Request New Link
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MagicLinkPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <MagicLinkContent />
    </Suspense>
  );
}