import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-blue-100">
      <div className="flex flex-col items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Healthcare Billing
            <span className="block text-blue-600">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Easily update your insurance information or pay for medical services 
            at discounted rates. Secure, fast, and hassle-free.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signin"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors shadow-lg"
            >
              Access Your Account
            </Link>
            <Link
              href="/help"
              className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-3 rounded-lg text-lg font-medium transition-colors border border-gray-300 shadow-lg"
            >
              Need Help?
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Update Insurance</h3>
              <p className="text-gray-600 text-sm">
                Upload new insurance cards or update your policy information quickly and securely.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Discounted Payments</h3>
              <p className="text-gray-600 text-sm">
                Pay for services directly at significantly reduced rates when insurance doesn&apos;t cover.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600 text-sm">
                Your health and financial information is protected with enterprise-grade security.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why This Exists Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Am I Receiving This Bill?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We understand receiving unexpected medical bills can be confusing. 
              Here&apos;s what&apos;s been happening and how we can resolve this together.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - The Problem */}
            <div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-red-800">The Challenge We&apos;ve Faced</h3>
                </div>
                <p className="text-red-700 text-sm leading-relaxed">
                  For the past <strong>3 years</strong>, we&apos;ve been working tirelessly to collect payment 
                  from insurance companies for medical services you received. Unfortunately, we&apos;ve been 
                  caught in a cycle of claim denials, delays, and administrative hurdles that have prevented 
                  us from receiving proper compensation.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-orange-600 text-xs font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Outdated Insurance Information</h4>
                    <p className="text-gray-600 text-sm">Insurance details may have changed since your visit</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-orange-600 text-xs font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Administrative Delays</h4>
                    <p className="text-gray-600 text-sm">Complex approval processes and bureaucratic obstacles</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-orange-600 text-xs font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Claim Denials</h4>
                    <p className="text-gray-600 text-sm">Various reasons preventing payment approval</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - The Solution */}
            <div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-green-800">How We Can Resolve This</h3>
                </div>
                <p className="text-green-700 text-sm leading-relaxed">
                  This portal gives you <strong>two simple options</strong> to resolve your outstanding balance. 
                  You can either help us get your insurance to pay by updating your information, or take 
                  advantage of significant discounts by paying directly.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <h4 className="font-medium text-blue-900">Option 1: Update Insurance</h4>
                  </div>
                  <p className="text-blue-800 text-sm">
                    Provide current insurance information so we can resubmit claims and get proper coverage
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <h4 className="font-medium text-purple-900">Option 2: Discounted Payment</h4>
                  </div>
                  <p className="text-purple-800 text-sm">
                    Pay directly at significantly reduced rates - often 80-90% less than the original amount
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="bg-gray-50 rounded-lg p-6 max-w-2xl mx-auto">
              <h4 className="font-semibold text-gray-900 mb-2">Our Commitment to You</h4>
              <p className="text-gray-700 text-sm">
                We believe in transparency and fairness. This portal was created to give you control over 
                your healthcare billing and ensure you&apos;re not caught in the middle of insurance complications. 
                We&apos;re here to help resolve this as quickly and affordably as possible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
