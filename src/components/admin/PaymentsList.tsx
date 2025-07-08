import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
const API_URL = import.meta.env.VITE_API_BASE_URL;

interface Payment {
  id: string;
  user_email: string;
  booking_id: string;
  amount: number;
  status: string;
  created_at: string;
}

const PaymentsList = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const {session} = useAuth();
  const token = session?.access_token;

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError('');
      try {
        const query = new URLSearchParams({
          page: page.toString(),
          status: statusFilter
        });
        const res = await fetch(`${API_URL}/admin/payments?${query}`,{
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Failed to fetch payments.');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setPayments(data.payments);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [page, statusFilter]);

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-lg shadow-lg mt-8">
      <div className='flex justify-between items-center'>
             <h2 className="text-2xl font-bold mb-6 text-blue-700">Payments List</h2>
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
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
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
      ) : payments.length === 0 ? (
        <div>No payments found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">Payment ID</th>
                <th className="px-4 py-2 border">Booking ID</th>
                <th className="px-4 py-2 border">Amount</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Payment Date</th>
                <th className="px-4 py-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border font-semibold">{payment.id}</td>
                  <td className="px-4 py-2 border">{payment.booking_id}</td>
                  <td className="px-4 py-2 border">₹{payment.amount.toFixed(2)}</td>
                  <td className="px-4 py-2 border">{payment.status}</td>
                  <td className="px-4 py-2 border">
                    {new Date(payment.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => setSelectedPayment(payment)}
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
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-blue-700">Payment Details</h3>
            <div className="space-y-2 text-gray-700">
              <p><strong>Payment ID:</strong> {selectedPayment.id}</p>
              <p><strong>Booking ID:</strong> {selectedPayment.booking_id}</p>
              <p><strong>Amount:</strong> ₹{selectedPayment.amount.toFixed(2)}</p>
              <p><strong>Status:</strong> {selectedPayment.status}</p>
              <p><strong>Payment Date:</strong> {new Date(selectedPayment.created_at).toLocaleString()}</p>
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => setSelectedPayment(null)}
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

export default PaymentsList;
