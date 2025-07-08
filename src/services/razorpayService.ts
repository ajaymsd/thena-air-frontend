const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface CreateOrderRequest {
  amount: number;
  currency: string;
  receipt: string;
  bookingId: string;
}

export interface CreateOrderResponse {
  success: boolean;
  order: {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
    created_at: number;
  };
}

export interface VerifyPaymentRequest {
  orderId: string;
  paymentId: string;
  signature: string;
  bookingId: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  verified: boolean;
  payment: {
    id: string;
    orderId: string;
    amount: number;
    currency: string;
    status: string;
    method: string;
    capturedAt: number;
    description: string;
  };
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  receipt: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    bookingId: string;
    tripType: string;
    cabinClass: string;
  };
  theme: {
    color: string;
  };
  config: any;
  handler: (response: any) => void;
  modal: {
    ondismiss: () => void;
  };
  onError: (error: any) => void;
}

// Create Razorpay order through backend
export const createOrder = async (request: CreateOrderRequest): Promise<CreateOrderResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/payment/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create order');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error creating order:', error);
    throw new Error(error.message || 'Failed to create payment order');
  }
};

// Verify payment through backend
export const verifyPayment = async (request: VerifyPaymentRequest): Promise<VerifyPaymentResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/payment/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Payment verification failed');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    throw new Error(error.message || 'Payment verification failed');
  }
};

// Initialize Razorpay payment
export const initializeRazorpayPayment = (options: RazorpayOptions): void => {
  if (typeof window !== 'undefined' && (window as any).Razorpay) {
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  } else {
    throw new Error('Razorpay is not loaded');
  }
};

// Create Razorpay options for payment
export const createRazorpayOptions = (
  order: CreateOrderResponse['order'],
  bookingData: any,
  selectedPaymentMethod: string,
  onSuccess: (response: any) => void,
  onError: (error: any) => void,
  onDismiss: () => void
): RazorpayOptions => {
  return {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_kHoczXP7xF4vnX',
    amount: order.amount,
    currency: order.currency,
    name: 'ThenaAir',
    description: `Flight Booking - ${bookingData.id}`,
    order_id: order.id,
    receipt: order.receipt,
    prefill: {
      name: bookingData.contact_email.split('@')[0],
      email: bookingData.contact_email,
      contact: bookingData.contact_phone
    },
    notes: {
      bookingId: bookingData.id,
      tripType: bookingData.trip_type,
      cabinClass: bookingData.cabin_class
    },
    theme: {
      color: '#3B82F6'
    },
    // Configure payment methods based on selection
    config: selectedPaymentMethod === 'upi' ? {
      display: {
        blocks: {
          upi: {
            name: "Pay via UPI",
            instruments: [
              {
                method: "upi"
              }
            ]
          }
        },
        sequence: ["block.upi"],
        preferences: {
          show_default_blocks: false
        }
      }
    } : {
      display: {
        blocks: {
          upi: {
            name: "Pay via UPI",
            instruments: [
              {
                method: "upi"
              }
            ]
          },
          card: {
            name: "Pay via Card",
            instruments: [
              {
                method: "card"
              }
            ]
          }
        },
        sequence: ["block.upi", "block.card"],
        preferences: {
          show_default_blocks: false
        }
      }
    },
    handler: onSuccess,
    modal: {
      ondismiss: onDismiss
    },
    onError: onError
  };
}; 