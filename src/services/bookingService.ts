import { supabase } from '../lib/supabase';

export interface PaymentData {
  id: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  method: string;
  provider: string;
  provider_ref: string;
  amount: number;
  currency: string;
  created_at: string;
}

export interface BookingData {
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
  latestPayment?: PaymentData;
}

// Fetch booking data from Supabase
export const fetchBookingData = async (bookingId: string): Promise<BookingData> => {
  try {
    const { data, error: fetchError } = await supabase
      .from('bookings')
      .select(`
        id,
        total_price,
        trip_type,
        cabin_class,
        status,
        contact_email,
        contact_phone,
        created_at,
        outbound_flight:outbound_flight_id(
          flight_number,
          airline,
          from_airport,
          to_airport,
          departure_time,
          arrival_time
        ),
        return_flight:return_flight_id(
          flight_number,
          airline,
          from_airport,
          to_airport,
          departure_time,
          arrival_time
        )
      `)
      .eq('id', bookingId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!data) {
      throw new Error('Booking not found');
    }

    // Transform the data to match our interface
    const transformedData: BookingData = {
      id: data.id,
      total_price: data.total_price,
      trip_type: data.trip_type,
      cabin_class: data.cabin_class,
      status: data.status,
      contact_email: data.contact_email,
      contact_phone: data.contact_phone,
      created_at: data.created_at,
      outbound_flight: data.outbound_flight[0] || {
        flight_number: '',
        airline: '',
        from_airport: '',
        to_airport: '',
        departure_time: '',
        arrival_time: ''
      },
      return_flight: data.return_flight?.[0] || undefined
    };

    return transformedData;
  } catch (error: any) {
    console.error('Error fetching booking:', error);
    throw new Error(error.message || 'Failed to load booking details');
  }
};

// Update booking status after payment
export const updateBookingStatus = async (
  bookingId: string,
  paymentData: {
    payment_id: string;
    razorpay_order_id: string;
  }
): Promise<void> => {
  try {
    // Only update booking status, payment details are stored in payments table
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        status: 'confirmed'
      })
      .eq('id', bookingId);

    if (updateError) {
      throw updateError;
    }
  } catch (error: any) {
    console.error('Error updating booking status:', error);
    throw new Error(error.message || 'Failed to update booking status');
  }
};

// Fetch all bookings for a user, including latest payment
export const fetchUserBookings = async (userId: string): Promise<BookingData[]> => {
  try {
    const { data, error: fetchError } = await supabase
      .from('bookings')
      .select(`
        id,
        total_price,
        trip_type,
        cabin_class,
        status,
        contact_email,
        contact_phone,
        created_at,
        outbound_flight:outbound_flight_id(
          flight_number,
          airline,
          from_airport,
          to_airport,
          departure_time,
          arrival_time
        ),
        return_flight:return_flight_id(
          flight_number,
          airline,
          from_airport,
          to_airport,
          departure_time,
          arrival_time
        ),
        payments:payments(
          id,
          status,
          method,
          provider,
          provider_ref,
          amount,
          currency,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

      console.log(data);
      

    if (fetchError) {
      throw fetchError;
    }

    if (!data) {
      return [];
    }

    // Transform the data to match our interface
    const transformedData: BookingData[] = data.map((booking: any) => {
      // Get the latest payment (by created_at desc)
      let latestPayment: PaymentData | undefined = undefined;
      if (booking.payments && booking.payments.length > 0) {
        latestPayment = [...booking.payments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      }
      return {
        id: booking.id,
        total_price: booking.total_price,
        trip_type: booking.trip_type,
        cabin_class: booking.cabin_class,
        status: booking.status,
        contact_email: booking.contact_email,
        contact_phone: booking.contact_phone,
        created_at: booking.created_at,
        outbound_flight: booking.outbound_flight || {
          flight_number: '',
          airline: '',
          from_airport: '',
          to_airport: '',
          departure_time: '',
          arrival_time: ''
        },
        return_flight: booking.return_flight?.[0] || undefined,
        latestPayment
      };
    });

    return transformedData;
  } catch (error: any) {
    console.error('Error fetching user bookings:', error);
    throw new Error(error.message || 'Failed to load user bookings');
  }
}; 