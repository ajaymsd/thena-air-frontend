import React from 'react';

interface PaymentFormProps {
  bookingData: any;
  onSubmit: (bookingData: any) => Promise<void>;
  paymentLoading: boolean;
  error: string | null;
  onErrorChange: (error: string | null) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  bookingData, 
  onSubmit, 
  paymentLoading,
  error,
  onErrorChange
}) => {

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(bookingData);
  };

  // Single payment method - Razorpay handles all payment options
  const paymentMethod = {
    id: 'razorpay',
    name: 'Secure Payment',
    icon: '🔒',
    description: 'Cards, UPI, NetBanking, Wallets'
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>
      
      {/* Test Mode Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h3 className="font-semibold text-yellow-900">🧪 Test Mode Notice</h3>
            <p className="text-sm text-yellow-800 mt-1">
              Card testing may show various restrictions (international cards, UTIB, etc.). 
              <strong className="ml-1">Use UPI for reliable testing: success@razorpay</strong>
            </p>
          </div>
        </div>
      </div>
      
      {/* Payment Method Display */}
      <div className="mb-8">
        <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50">
          <div className="text-2xl mb-2">{paymentMethod.icon}</div>
          <div className="text-sm font-semibold text-gray-900">{paymentMethod.name}</div>
          <div className="text-xs text-gray-500">{paymentMethod.description}</div>
        </div>
      </div>

      {/* Test Mode Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2">🧪 Test Mode Information:</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>✅ Recommended:</strong> Use UPI for testing (most reliable)</p>
          <p><strong>Test UPI:</strong> success@razorpay</p>
          <p><strong>Test Cards:</strong> 4111 1111 1111 1111 (may have restrictions)</p>
          <p><strong>Note:</strong> Razorpay modal will show all available payment methods</p>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={paymentLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold py-4 px-6 rounded-lg text-lg shadow-lg transition-all duration-200 flex items-center justify-center"
        >
          {paymentLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Payment...
            </>
          ) : (
            `Pay ₹${bookingData.total_price.toLocaleString()}`
          )}
        </button>
      </form>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <p className="text-sm text-gray-600">
            Your payment is secured with 256-bit SSL encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm; 