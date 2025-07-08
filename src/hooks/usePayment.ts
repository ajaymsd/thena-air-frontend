import { useState } from 'react';
import { createOrder, verifyPayment, createRazorpayOptions, initializeRazorpayPayment } from '../services/razorpayService';
import { updateBookingStatus } from '../services/bookingService';



export interface UsePaymentReturn {
  paymentLoading: boolean;
  error: string | null;
  success: boolean;
  setError: (error: string | null) => void;
  processPayment: (bookingData: any) => Promise<void>;
  resetPayment: () => void;
}

export const usePayment = (): UsePaymentReturn => {
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const processPayment = async (bookingData: any): Promise<void> => {
    setPaymentLoading(true);
    setError(null);

    try {
      // Create order through backend
      const order = await createOrder({
        amount: bookingData.total_price,
        currency: 'INR',
        receipt: `bk_${Date.now()}_${bookingData.id.slice(-8)}`,
        bookingId: bookingData.id
      });

      // Handle payment success
      const handlePaymentSuccess = async (response: any) => {
        try {
          setPaymentLoading(true);

          console.log('Payment successful:', response);

          // Verify payment through backend
          await verifyPayment({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            bookingId: bookingData.id
          });

          // Update booking status
          await updateBookingStatus(bookingData.id, {
            payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id
          });

          setSuccess(true);
        } catch (err: any) {
          setError(err.message || 'Payment verification failed');
          setPaymentLoading(false);
        }
      };

      // Handle payment error
      const handlePaymentError = (error: any) => {
        console.error('Razorpay error:', error);
        if (error.error && error.error.description) {
          const description = error.error.description.toLowerCase();
          const reason = error.error.reason;
          
          if (description.includes('international cards are not supported') || 
              reason === 'international_transaction_not_allowed') {
            setError('Card testing is restricted in test mode. Please use UPI for testing: success@razorpay');
          } else if (description.includes('not supported') || 
                     description.includes('card not supported') ||
                     description.includes('utib')) {
            setError('This card type is not supported in test mode. Please use UPI for testing: success@razorpay');
          } else if (description.includes('card declined') || 
                     description.includes('payment failed')) {
            setError('Payment was declined. Please try UPI for testing: success@razorpay');
          } else {
            setError(error.error.description);
          }
        } else {
          setError('Payment failed. Please try again or use a different payment method.');
        }
        setPaymentLoading(false);
      };

      // Handle modal dismiss
      const handleModalDismiss = () => {
        setPaymentLoading(false);
      };

      // Create Razorpay options (no specific payment method - Razorpay handles all)
      const options = createRazorpayOptions(
        order.order,
        bookingData,
        'razorpay', // Default to razorpay which shows all methods
        handlePaymentSuccess,
        handlePaymentError,
        handleModalDismiss
      );

      // Initialize Razorpay payment
      await initializeRazorpayPayment(options);

    } catch (err: any) {
      console.error('Payment processing error:', err);
      setError(err.message || 'Failed to process payment');
      setPaymentLoading(false);
    }
  };

  const resetPayment = () => {
    setError(null);
    setSuccess(false);
    setPaymentLoading(false);
  };

  return {
    paymentLoading,
    error,
    success,
    setError,
    processPayment,
    resetPayment
  };
}; 