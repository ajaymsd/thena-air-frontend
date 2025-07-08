import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const {session} = useAuth();
  const token = session?.access_token;

  const [stats, setStats] = useState({
    total_flights: 0,
    total_bookings: 0,
    total_users: 0,
    recent_flights: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/dashboard`,{
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg hidden md:flex flex-col">
        <div className="h-20 flex items-center justify-center border-b">
          <span className="text-2xl font-bold text-blue-600">ThenaAir Admin</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link to="/admin/dashboard" className="block px-4 py-2 rounded text-blue-700 bg-blue-100 font-semibold">
            Dashboard
          </Link>
          <Link to="/admin/flights" className="block px-4 py-2 rounded hover:bg-gray-100">
            Manage Flights
          </Link>
          <Link to="/admin/bookings" className="block px-4 py-2 rounded hover:bg-gray-100">
            View Bookings
          </Link>
          <Link to="/admin/payments" className="block px-4 py-2 rounded hover:bg-gray-100">
            View Payments
          </Link>
          <Link to="/admin/add-flight" className="block px-4 py-2 rounded hover:bg-gray-100">
            Add Flight
          </Link>
        </nav>
        <div className="p-4 border-t">
          <button 
            onClick={handleLogout}
            className="w-full py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 font-semibold"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-20 bg-white shadow flex items-center px-6 justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, Admin</span>
            <img src="https://ui-avatars.com/api/?name=TA" alt="Admin" className="w-10 h-10 rounded-full border" />
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <span className="text-sm text-gray-500">Total Flights</span>
              <span className="text-3xl font-bold text-blue-600 mt-2">{stats.total_flights}</span>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <span className="text-sm text-gray-500">Total Bookings</span>
              <span className="text-3xl font-bold text-green-600 mt-2">{stats.total_bookings}</span>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <span className="text-sm text-gray-500">Payments Done</span>
              <span className="text-3xl font-bold text-purple-600 mt-2">{stats.total_users}</span>
            </div>
          </div>

          {/* Recent Flights Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Recent Flights</h2>
              <Link to="/admin/add-flight" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">
                + Add Flight
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : stats.recent_flights.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No recent flights found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 border">Flight #</th>
                      <th className="px-4 py-2 border">Airline</th>
                      <th className="px-4 py-2 border">From</th>
                      <th className="px-4 py-2 border">To</th>
                      <th className="px-4 py-2 border">Departure</th>
                      <th className="px-4 py-2 border">Arrival</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_flights.map((flight) => (
                      <tr key={flight.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border font-semibold">{flight.flight_number}</td>
                        <td className="px-4 py-2 border">{flight.airline}</td>
                        <td className="px-4 py-2 border">{flight.from_airport}</td>
                        <td className="px-4 py-2 border">{flight.to_airport}</td>
                        <td className="px-4 py-2 border">{new Date(flight.departure_time).toLocaleString()}</td>
                        <td className="px-4 py-2 border">{new Date(flight.arrival_time).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
