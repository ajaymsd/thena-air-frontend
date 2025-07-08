import React from 'react';

interface BookingSummaryProps {
  bookingData: any;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({ bookingData }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Summary</h3>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Booking ID</span>
          <span className="font-mono text-sm font-semibold">{bookingData.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total Amount</span>
          <span className="text-lg font-bold text-gray-900">₹{bookingData.total_price.toLocaleString()}</span>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between text-lg font-bold">
          <span>Amount to Pay</span>
          <span className="text-blue-600">₹{bookingData.total_price.toLocaleString()}</span>
        </div>
      </div>

      {/* Payment Methods Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Accepted Payment Methods</h4>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-white px-2 py-1 rounded">Visa</span>
          <span className="text-xs bg-white px-2 py-1 rounded">Mastercard</span>
          <span className="text-xs bg-white px-2 py-1 rounded">RuPay</span>
          <span className="text-xs bg-white px-2 py-1 rounded">UPI</span>
          <span className="text-xs bg-white px-2 py-1 rounded">Net Banking</span>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary; 