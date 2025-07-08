import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PaymentSuccessProps {
  bookingData: any;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ bookingData }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              Your booking has been confirmed. You will receive a confirmation email shortly.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Booking ID</p>
              <p className="font-mono text-lg font-semibold text-gray-900">{bookingData.id}</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/profile')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg"
              >
                View My Bookings
              </button>
              <button
                onClick={() => navigate('/home')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg"
              >
                Book Another Flight
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccess; 