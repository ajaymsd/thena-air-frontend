import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { BookingData } from '../services/bookingService';
import { formatDate, formatTime } from '../lib/dateHelpers';

interface BookingListProps {
  bookings: BookingData[];
  loading: boolean;
  error: string | null;
}

const BookingList: React.FC<BookingListProps> = ({ bookings, loading, error }) => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const getStatusBadge = (status: string, latestPayment?: BookingData['latestPayment']) => {
    if (latestPayment && latestPayment.status === 'success') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Paid
        </span>
      );
    } else if (status === 'confirmed') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Confirmed
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pending Payment
        </span>
      );
    }
  };

  const handlePayment = (booking: BookingData) => {
    navigate('/checkout', { 
      state: { 
        bookingId: booking.id,
        totalPrice: booking.total_price 
      } 
    });
  };

  const handleViewDetails = (booking: BookingData) => {
    // Navigate to booking details page (you can implement this later)
    console.log('View booking details:', booking.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        <span className="ml-2 text-gray-600">Loading bookings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Error loading bookings</div>
        <div className="text-sm text-gray-500">{error}</div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-2">No bookings found</div>
        <div className="text-sm text-gray-400">Start by booking your first flight!</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const isPaid = booking.latestPayment && booking.latestPayment.status === 'success';
        return (
          <div key={booking.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Booking #{booking.id.slice(-8)}</h3>
                  <p className="text-sm text-gray-500">{formatDate(booking.created_at)}</p>
                </div>
              </div>
              {getStatusBadge(booking.status, booking.latestPayment)}
            </div>

            {/* Flight Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Outbound Flight */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Outbound</span>
                  <span className="text-xs text-gray-500">{booking.trip_type === 'roundtrip' ? 'Departure' : 'Flight'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-medium">{booking.outbound_flight.from_airport || '--'} → {booking.outbound_flight.to_airport || '--'}</div>
                    <div className="text-gray-500">{booking.outbound_flight.airline} {booking.outbound_flight.flight_number}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium">{formatTime(booking.outbound_flight.departure_time)}</div>
                    <div className="text-gray-500">{formatTime(booking.outbound_flight.arrival_time)}</div>
                  </div>
                </div>
              </div>

              {booking.return_flight && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Return</span>
                    <span className="text-xs text-gray-500">Return</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <div className="font-medium">{booking.return_flight.from_airport || '--'} → {booking.return_flight.to_airport || '--'}</div>
                      <div className="text-gray-500">{booking.return_flight.airline} {booking.return_flight.flight_number}</div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">{formatTime(booking.return_flight.departure_time)}</div>
                      <div className="text-gray-500">{formatTime(booking.return_flight.arrival_time)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Booking Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-500">Trip Type:</span>
                <div className="font-medium capitalize">{booking.trip_type}</div>
              </div>
              <div>
                <span className="text-gray-500">Cabin Class:</span>
                <div className="font-medium capitalize">{booking.cabin_class}</div>
              </div>
              <div>
                <span className="text-gray-500">Total Price:</span>
                <div className="font-medium text-green-600">₹{booking.total_price.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <div className="font-medium capitalize">{booking.status}</div>
              </div>
            </div>

            {/* Payment Details */}
            {booking.latestPayment && (
              <div className="mb-4 text-xs text-gray-500">
                <span className="font-semibold">Payment Method:</span> {booking.latestPayment.method} | <span className="font-semibold">Provider:</span> {booking.latestPayment.provider} | <span className="font-semibold">Status:</span> {booking.latestPayment.status}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                onClick={() => handleViewDetails(booking)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View Details
              </button>
              
              <div className="flex space-x-2">
                {!isPaid && (
                  <button
                    onClick={() => handlePayment(booking)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Pay Now
                  </button>
                )}
                {isPaid && (
                  <button
                    onClick={() => window.open(`${API_URL}/ticket/${booking.id}/pdf`, '_blank')}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    View Ticket
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BookingList; 