import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
const API_URL = import.meta.env.VITE_API_BASE_URL;

interface Cabin {
  id: string;
  cabin_class: string;
  price: number;
  available_seats: number;
  total_seats: number;
}

interface Flight {
  id: string;
  flight_number: string;
  airline: string;
  from_airport: string;
  to_airport: string;
  departure_time: string;
  arrival_time: string;
  duration_minutes: number;
  stops: number;
  aircraft_type?: string;
  cabins: Cabin[];
}

const FlightsList = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [updating, setUpdating] = useState(false);
  const [filters, setFilters] = useState({ airline: '', from: '', to: '' });
  const [sortBy, setSortBy] = useState('');
  const {session} = useAuth();
  const token = session?.access_token;

  const fetchFlights = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/admin/flights`,{
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to fetch flights.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setFlights(data);
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this flight?')) return;
    try {
      const res = await fetch(`${API_URL}/admin/flights/${id}`, { method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
      if (!res.ok) {
        alert('Failed to delete flight');
        return;
      }
      fetchFlights();
    } catch (err) {
      alert('Error deleting flight');
    }
  };

  const handleUpdate = async () => {
    if (!selectedFlight) return;
    setUpdating(true);
    try {
      const res = await fetch(`${API_URL}/admin/flights/${selectedFlight.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, },
        body: JSON.stringify(selectedFlight),
      });
      if (!res.ok) {
        alert('Failed to update flight');
        return;
      }
      setSelectedFlight(null);
      fetchFlights();
    } catch (err) {
      alert('Error updating flight');
    } finally {
      setUpdating(false);
    }
  };

  const filteredFlights = flights
    .filter((flight) =>
      (!filters.airline || flight.airline.toLowerCase().includes(filters.airline.toLowerCase())) &&
      (!filters.from || flight.from_airport.toLowerCase().includes(filters.from.toLowerCase())) &&
      (!filters.to || flight.to_airport.toLowerCase().includes(filters.to.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'departure') {
        return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime();
      } else if (sortBy === 'duration') {
        return a.duration_minutes - b.duration_minutes;
      } else if (sortBy === 'price') {
        const aPrice = Math.min(...a.cabins.map(c => c.price));
        const bPrice = Math.min(...b.cabins.map(c => c.price));
        return aPrice - bPrice;
      }
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white rounded-lg shadow-lg mt-8">
       <div className='flex justify-between items-center'>
             <h2 className="text-2xl font-bold mb-6 text-blue-700">Flights List</h2>
             <Link to='/admin/dashboard' className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'>Back to Dashboard</Link>
        </div>

      {/* Filters and Sorting */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Filter by Airline"
          className="border p-2 rounded w-full"
          value={filters.airline}
          onChange={(e) => setFilters({ ...filters, airline: e.target.value })}
        />
        <input
          type="text"
          placeholder="Filter by From Airport"
          className="border p-2 rounded w-full"
          value={filters.from}
          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
        />
        <input
          type="text"
          placeholder="Filter by To Airport"
          className="border p-2 rounded w-full"
          value={filters.to}
          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
        />
        <select
          className="border p-2 rounded w-full"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="">Sort By</option>
          <option value="departure">Departure Time</option>
          <option value="price">Price (Lowest)</option>
          <option value="duration">Duration</option>
        </select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : filteredFlights.length === 0 ? (
        <div>No flights found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 border">Flight #</th>
                <th className="px-4 py-2 border">Airline</th>
                <th className="px-4 py-2 border">From</th>
                <th className="px-4 py-2 border">To</th>
                <th className="px-4 py-2 border">Departure</th>
                <th className="px-4 py-2 border">Arrival</th>
                <th className="px-4 py-2 border">Duration</th>
                <th className="px-4 py-2 border">Stops</th>
                <th className="px-4 py-2 border">Aircraft</th>
                <th className="px-4 py-2 border">Cabins</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFlights.map((flight) => (
                <tr key={flight.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{flight.flight_number}</td>
                  <td className="px-4 py-2 border">{flight.airline}</td>
                  <td className="px-4 py-2 border">{flight.from_airport}</td>
                  <td className="px-4 py-2 border">{flight.to_airport}</td>
                  <td className="px-4 py-2 border">{new Date(flight.departure_time).toLocaleString()}</td>
                  <td className="px-4 py-2 border">{new Date(flight.arrival_time).toLocaleString()}</td>
                  <td className="px-4 py-2 border">{flight.duration_minutes} min</td>
                  <td className="px-4 py-2 border">{flight.stops}</td>
                  <td className="px-4 py-2 border">{flight.aircraft_type || '-'}</td>
                  <td className="px-4 py-2 border">
                    <ul className="space-y-1">
                      {flight.cabins?.length ? (
                        flight.cabins.map((cabin) => (
                          <li key={cabin.id} className="text-xs bg-blue-50 rounded px-2 py-1 mb-1">
                            <strong>{cabin.cabin_class}</strong>: ₹{cabin.price} | {cabin.available_seats}/{cabin.total_seats} seats
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-gray-400">No cabins</li>
                      )}
                    </ul>
                  </td>
                  <td className="px-4 py-2 border space-x-2">
                    <button
                      onClick={() => setSelectedFlight(flight)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(flight.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Update Modal */}
      {selectedFlight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-blue-700">Update Flight & Cabins</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={selectedFlight.flight_number}
                onChange={(e) =>
                  setSelectedFlight({ ...selectedFlight, flight_number: e.target.value })
                }
                placeholder="Flight Number"
                className="border p-2 w-full"
              />
              <input
                type="text"
                value={selectedFlight.airline}
                onChange={(e) =>
                  setSelectedFlight({ ...selectedFlight, airline: e.target.value })
                }
                placeholder="Airline"
                className="border p-2 w-full"
              />

              <h4 className="font-semibold mt-4">Cabins</h4>
              {selectedFlight.cabins.map((cabin, idx) => (
                <div key={cabin.id} className="border p-2 rounded mb-2 space-y-2">
                  <select
                    value={cabin.cabin_class}
                    onChange={(e) => {
                      const updated = [...selectedFlight.cabins];
                      updated[idx].cabin_class = e.target.value;
                      setSelectedFlight({ ...selectedFlight, cabins: updated });
                    }}
                    className="border p-2 w-full"
                  >
                    <option value="Economy">Economy</option>
                    <option value="Business">Business</option>
                    <option value="First">First</option>
                  </select>
                  <input
                    type="number"
                    value={cabin.price}
                    onChange={(e) => {
                      const updated = [...selectedFlight.cabins];
                      updated[idx].price = Number(e.target.value);
                      setSelectedFlight({ ...selectedFlight, cabins: updated });
                    }}
                    placeholder="Price"
                    className="border p-2 w-full"
                  />
                  <input
                    type="number"
                    value={cabin.available_seats}
                    onChange={(e) => {
                      const updated = [...selectedFlight.cabins];
                      updated[idx].available_seats = Number(e.target.value);
                      setSelectedFlight({ ...selectedFlight, cabins: updated });
                    }}
                    placeholder="Available Seats"
                    className="border p-2 w-full"
                  />
                  <input
                    type="number"
                    value={cabin.total_seats}
                    onChange={(e) => {
                      const updated = [...selectedFlight.cabins];
                      updated[idx].total_seats = Number(e.target.value);
                      setSelectedFlight({ ...selectedFlight, cabins: updated });
                    }}
                    placeholder="Total Seats"
                    className="border p-2 w-full"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedFlight(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {updating ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightsList;
