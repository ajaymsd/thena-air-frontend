import React, { useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from './layout/Header';
import PaymentForm from './payment/PaymentForm';
import BookingSummary from './payment/BookingSummary';
import PaymentSuccess from './payment/PaymentSuccess';
import { useBooking } from '../hooks/useBooking';
import { usePayment } from '../hooks/usePayment';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CheckoutLocationState {
  bookingId: string;
  totalPrice: number;
}

interface BookingData {
  id: string;
  total_price: number;
  trip_type: string;
  cabin_class: string;
  status: string;
  contact_email: string;
  contact_phone: string;
  created_at: string;
  outbound_flight: {
    flight_number: string;
    airline: string;
    from_airport: string;
    to_airport: string;
    departure_time: string;
    arrival_time: string;
  };
  return_flight?: {
    flight_number: string;
    airline: string;
    from_airport: string;
    to_airport: string;
    departure_time: string;
    arrival_time: string;
  };
}



// Backend API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  // Get booking ID from URL params or state
  const bookingIdFromUrl = searchParams.get('bookingId');
  const state = location.state as CheckoutLocationState | undefined;
  const bookingId = bookingIdFromUrl || state?.bookingId;

  // Use custom hooks for data management
  const { bookingData, loading, error } = useBooking(bookingId || null);
  const { 
    success, 
    processPayment, 
    paymentLoading,
    error: paymentError,
    setError
  } = usePayment();

  // Redirect if no booking ID
  useEffect(() => {
    if (!bookingId && !loading) {
      navigate('/home');
    }
  }, [bookingId, loading, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Booking not found'}</p>
          <button onClick={() => navigate('/home')} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Show success state
  if (success) {
    return <PaymentSuccess bookingData={bookingData} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
            <p className="text-gray-600">Secure payment powered by ThenaAir</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <PaymentForm 
                bookingData={bookingData}
                onSubmit={processPayment}
                paymentLoading={paymentLoading}
                error={paymentError}
                onErrorChange={setError}
              />
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <BookingSummary bookingData={bookingData} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage; 