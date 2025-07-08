import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const CABIN_CLASSES = ['Economy', 'Premium Economy', 'Business', 'First'];
const API_URL = import.meta.env.VITE_API_BASE_URL;

const AddFlight = () => {
  const navigate = useNavigate();
  const {session} = useAuth();
  const token = session?.access_token;

  const [flight, setFlight] = useState({
    flight_number: '',
    airline: '',
    from_airport: '',
    to_airport: '',
    departure_time: '',
    arrival_time: '',
    duration_minutes: '',
    stops: 0,
    aircraft_type: '',
  });

  const [cabins, setCabins] = useState([
    { cabin_class: 'Economy', price: '', available_seats: '', total_seats: '' }
  ]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFlightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFlight({ ...flight, [e.target.name]: e.target.value });
  };

  const handleCabinChange = (idx: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newCabins = cabins.map((cabin, i) =>
      i === idx ? { ...cabin, [e.target.name]: e.target.value } : cabin
    );
    setCabins(newCabins);
  };

  const addCabin = () => {
    setCabins([...cabins, { cabin_class: 'Economy', price: '', available_seats: '', total_seats: '' }]);
  };

  const removeCabin = (idx: number) => {
    setCabins(cabins.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...flight,
        duration_minutes: Number(flight.duration_minutes),
        stops: Number(flight.stops),
        cabins: cabins.map(cabin => ({
          ...cabin,
          price: Number(cabin.price),
          available_seats: Number(cabin.available_seats),
          total_seats: Number(cabin.total_seats),
        }))
      };

      const res = await fetch(`${API_URL}/admin/flights`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',

        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to add flight.');
        setLoading(false);
        return;
      }

      navigate('/admin/flights');
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg mt-8">
         <div className='flex justify-between items-center'>
             <h2 className="text-2xl font-bold mb-6 text-blue-700">Add New Flight</h2>
             <Link to='/admin/dashboard' className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'>Back to Dashboard</Link>
        </div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            ['flight_number', 'Flight Number'],
            ['airline', 'Airline'],
            ['from_airport', 'From Airport'],
            ['to_airport', 'To Airport'],
            ['departure_time', 'Departure Time', 'datetime-local'],
            ['arrival_time', 'Arrival Time', 'datetime-local'],
            ['duration_minutes', 'Duration (minutes)', 'number'],
            ['stops', 'Stops', 'number'],
            ['aircraft_type', 'Aircraft Type'],
          ].map(([name, label, type = 'text']) => (
            <div key={name as string}>
              <label className="block mb-1 font-medium">{label}</label>
              <input
                type={type as string}
                name={name as string}
                className="w-full border px-3 py-2 rounded"
                value={(flight as any)[name as string]}
                onChange={handleFlightChange}
                required
              />
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Cabin Classes</h3>
          {cabins.map((cabin, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="block mb-1 font-medium">Class</label>
                <select
                  name="cabin_class"
                  className="w-full border px-3 py-2 rounded"
                  value={cabin.cabin_class}
                  onChange={e => handleCabinChange(idx, e)}
                  required
                >
                  {CABIN_CLASSES.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
              {['price', 'available_seats', 'total_seats'].map(field => (
                <div key={field}>
                  <label className="block mb-1 font-medium">{field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                  <input
                    type="number"
                    name={field}
                    className="w-full border px-3 py-2 rounded"
                    value={(cabin as any)[field]}
                    onChange={e => handleCabinChange(idx, e)}
                    required
                    min={0}
                  />
                </div>
              ))}
              <div className="flex items-end">
                {cabins.length > 1 && (
                  <button
                    type="button"
                    className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 w-full"
                    onClick={() => removeCabin(idx)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-semibold"
            onClick={addCabin}
          >
            + Add Cabin Class
          </button>
        </div>

        {error && <div className="text-red-600 font-medium">{error}</div>}

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Flight'}
        </button>
      </form>
    </div>
  );
};

export default AddFlight;
