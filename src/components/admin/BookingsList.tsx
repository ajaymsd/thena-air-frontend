import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
const API_URL = import.meta.env.VITE_API_BASE_URL;

interface Booking {
  id: string;
  user_id: string;
  contact_email: string;
  contact_phone: string;
  outbound_flight_id: string;
  return_flight_id: string;
  trip_type: string;
  cabin_class: string;
  total_price: number;
  status: string;
  created_at: string;
}

const BookingsList = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const {session} = useAuth();
  const token = session?.access_token;

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError('');
      try {
        const query = new URLSearchParams({
          page: page.toString(),
          status: statusFilter
        });
       
       const res = await fetch(`${API_URL}/admin/bookings?${query}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Failed to fetch bookings.');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setBookings(data.bookings);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [page, statusFilter]);

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-lg shadow-lg mt-8">
        <div className='flex justify-between items-center'>
             <h2 className="text-2xl font-bold mb-6 text-blue-700">Bookings List</h2>
             <Link to='/admin/dashboard' className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'>Back to Dashboard</Link>
        </div>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <label className="mr-2 font-semibold">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border px-3 py-2 rounded"
          >
            <option value="">All</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : bookings.length === 0 ? (
        <div>No bookings found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">Booking ID</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Trip Type</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Created At</th>
                <th className="px-4 py-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{booking.id}</td>
                  <td className="px-4 py-2 border">{booking.contact_email}</td>
                  <td className="px-4 py-2 border">{booking.trip_type}</td>
                  <td className="px-4 py-2 border">{booking.status}</td>
                  <td className="px-4 py-2 border">{new Date(booking.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center space-x-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-blue-700">Booking Details</h3>
            <div className="space-y-2 text-gray-700">
              <p><strong>Booking ID:</strong> {selectedBooking.id}</p>
              <p><strong>User ID:</strong> {selectedBooking.user_id}</p>
              <p><strong>Email:</strong> {selectedBooking.contact_email}</p>
              <p><strong>Phone:</strong> {selectedBooking.contact_phone}</p>
              <p><strong>Trip Type:</strong> {selectedBooking.trip_type}</p>
              <p><strong>Cabin Class:</strong> {selectedBooking.cabin_class}</p>
              <p><strong>Total Price:</strong> ₹{selectedBooking.total_price}</p>
              <p><strong>Status:</strong> {selectedBooking.status}</p>
              <p><strong>Outbound Flight:</strong> {selectedBooking.outbound_flight_id}</p>
              {selectedBooking.return_flight_id && (
                <p><strong>Return Flight:</strong> {selectedBooking.return_flight_id}</p>
              )}
              <p><strong>Created At:</strong> {new Date(selectedBooking.created_at).toLocaleString()}</p>
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => setSelectedBooking(null)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsList;
