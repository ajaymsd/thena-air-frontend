import { useState, useEffect } from 'react';
import { fetchBookingData } from '../services/bookingService';
import type { BookingData } from '../services/bookingService';

export interface UseBookingReturn {
  bookingData: BookingData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useBooking = (bookingId: string | null): UseBookingReturn => {
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!bookingId) {
      setError('No booking ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await fetchBookingData(bookingId);
      setBookingData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load booking details');
      console.error('Error fetching booking:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [bookingId]);

  const refetch = async () => {
    await fetchData();
  };

  return {
    bookingData,
    loading,
    error,
    refetch
  };
}; 