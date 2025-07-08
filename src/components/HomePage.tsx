import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Header from './layout/Header'

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
  cabins: any[];
}

const FlightCard: React.FC<{
  flight: Flight;
  onSelect: (flight: Flight) => void;
  buttonLabel: string;
  buttonColor?: string;
}> = ({ flight, onSelect, buttonLabel, buttonColor }) => (
  <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-between h-full">
    <div>
      <div className="font-semibold text-lg">{flight.from_airport} → {flight.to_airport}</div>
      <div className="text-gray-500 text-sm">{flight.airline} {flight.flight_number}</div>
      <div className="text-gray-500 text-sm">Departure: {flight.departure_time.slice(0, 16).replace('T', ' ')}</div>
      <div className="text-gray-500 text-sm">Arrival: {flight.arrival_time.slice(0, 16).replace('T', ' ')}</div>
      <div className="text-gray-700 text-sm mt-2">
        {flight.cabins.map((cabin) => (
          <span key={cabin.id} className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold mr-2 mb-1">
            {cabin.cabin_class}: ₹{cabin.price.toLocaleString()} ({cabin.available_seats} seats)
          </span>
        ))}
      </div>
    </div>
    <button
      className={`mt-4 ${buttonColor || 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-2 rounded-lg font-medium`}
      onClick={() => onSelect(flight)}
    >
      {buttonLabel}
    </button>
  </div>
);

const HomePage: React.FC = () => {
  console.log(import.meta.env.VITE_SUPABASE_URL);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchForm, setSearchForm] = useState({
    tripType: 'oneway',
    from: '',
    to: '',
    departureDate: '',
    returnDate: '',
    adults: 1,
    children: 0,
    infants: 0,
    cabinClass: 'Economy'
  });

  const [allFlights, setAllFlights] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [selectingReturn, setSelectingReturn] = useState(false);
  const [selectedOutbound, setSelectedOutbound] = useState<Flight | null>(null);
  const [returnOptions, setReturnOptions] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: flightsData, error: flightsError } = await supabase.from('flights').select('*');
        if (flightsError || !flightsData) {
          setError(flightsError?.message || 'Failed to fetch flights');
          setLoading(false);
          return;
        }

        const { data: cabinsData, error: cabinsError } = await supabase.from('flight_cabins').select('*');
        if (cabinsError || !cabinsData) {
          setError(cabinsError?.message || 'Failed to fetch cabins');
          setLoading(false);
          return;
        }

        const flightsWithCabins = flightsData.map((flight) => ({
          ...flight,
          cabins: cabinsData.filter((cabin) => cabin.flight_id === flight.id)
        }));

        setAllFlights(flightsWithCabins);
        setFilteredFlights(flightsWithCabins);
        console.log('✅ Flights fetched:', flightsWithCabins);
      } catch (err) {
        console.error('Unexpected fetch error:', err);
        setError('Unexpected error occurred');
      }
      setLoading(false);
    };

    fetchFlights();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let filtered = allFlights;

    if (searchForm.from) {
      filtered = filtered.filter(flight => flight.from_airport.toLowerCase().includes(searchForm.from.toLowerCase()));
    }
    if (searchForm.to) {
      filtered = filtered.filter(flight => flight.to_airport.toLowerCase().includes(searchForm.to.toLowerCase()));
    }
    if (searchForm.cabinClass && searchForm.cabinClass !== 'All') {
      filtered = filtered.filter(flight => flight.cabins.some(cabin => cabin.cabin_class === searchForm.cabinClass));
    }

    setFilteredFlights(filtered);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePassengerChange = (type: 'adults' | 'children' | 'infants', operation: 'increase' | 'decrease') => {
    setSearchForm(prev => ({
      ...prev,
      [type]: operation === 'increase' ? prev[type] + 1 : Math.max(0, prev[type] - 1)
    }));
  };

  const totalPassengers = searchForm.adults + searchForm.children + searchForm.infants;

  const handleSelectFlight = (flight: Flight) => {
    if (searchForm.tripType === 'roundtrip' && !selectingReturn) {
      setSelectedOutbound(flight);
      const options = allFlights.filter((f) => {
        const isReverse = f.from_airport.toLowerCase() === flight.to_airport.toLowerCase() && f.to_airport.toLowerCase() === flight.from_airport.toLowerCase();
        if (!isReverse) return false;
        if (searchForm.returnDate) {
          return f.departure_time.slice(0, 10) === searchForm.returnDate;
        }
        return true;
      });
      setReturnOptions(options);
      setSelectingReturn(true);
    } else if (searchForm.tripType === 'roundtrip' && selectingReturn && selectedOutbound) {
      navigate(`/booking?tripType=roundtrip&outboundFlightId=${selectedOutbound.id}&returnFlightId=${flight.id}&cabinClass=${searchForm.cabinClass}&adults=${searchForm.adults}&children=${searchForm.children}&infants=${searchForm.infants}`);
    } else {
      navigate(`/booking?tripType=oneway&outboundFlightId=${flight.id}&cabinClass=${searchForm.cabinClass}&adults=${searchForm.adults}&children=${searchForm.children}&infants=${searchForm.infants}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      <Header 
        showProfileButton={!!user}
        showLogoutButton={!!user}
      />

      {/* Hero Section with Search */}
      <section className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Content */}
          <div className="text-center text-white mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Find Your Perfect Flight
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Discover amazing deals on flights to destinations around the world. 
              Book with confidence and travel with ease.
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-6xl mx-auto">
            <form onSubmit={handleSearch} className="space-y-6">
              {/* Trip Type */}
              <div className="flex justify-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tripType"
                    value="oneway"
                    checked={searchForm.tripType === 'oneway'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-gray-700 font-medium">One Way</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tripType"
                    value="roundtrip"
                    checked={searchForm.tripType === 'roundtrip'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-gray-700 font-medium">Round Trip</span>
                </label>
              </div>

              {/* Route and Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* From */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                  <input
                    type="text"
                    name="from"
                    value={searchForm.from}
                    onChange={handleInputChange}
                    placeholder="City or Airport"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                  <input
                    type="text"
                    name="to"
                    value={searchForm.to}
                    onChange={handleInputChange}
                    placeholder="City or Airport"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Departure Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Departure</label>
                  <input
                    type="date"
                    name="departureDate"
                    value={searchForm.departureDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Return Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {searchForm.tripType === 'roundtrip' ? 'Return' : 'Date'}
                  </label>
                  <input
                    type="date"
                    name="returnDate"
                    value={searchForm.returnDate}
                    onChange={handleInputChange}
                    disabled={searchForm.tripType === 'oneway'}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      searchForm.tripType === 'oneway' ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Passengers and Cabin Class */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Passengers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passengers ({totalPassengers})
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Adults (12+)</span>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handlePassengerChange('adults', 'decrease')}
                            disabled={searchForm.adults <= 1}
                            className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{searchForm.adults}</span>
                          <button
                            type="button"
                            onClick={() => handlePassengerChange('adults', 'increase')}
                            className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Children (2-11)</span>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handlePassengerChange('children', 'decrease')}
                            className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{searchForm.children}</span>
                          <button
                            type="button"
                            onClick={() => handlePassengerChange('children', 'increase')}
                            className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Infants (0-1)</span>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handlePassengerChange('infants', 'decrease')}
                            className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{searchForm.infants}</span>
                          <button
                            type="button"
                            onClick={() => handlePassengerChange('infants', 'increase')}
                            disabled={searchForm.infants >= searchForm.adults}
                            className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cabin Class */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cabin Class</label>
                  <select
                    name="cabinClass"
                    value={searchForm.cabinClass}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Economy">Economy</option>
                    <option value="Premium Economy">Premium Economy</option>
                    <option value="Business">Business</option>
                    <option value="First">First</option>
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <div className="text-center">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  Search Flights
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Flights Section */}
      <section className="py-16 px-4 flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Available Flights
            </h2>
            <p className="text-gray-600 text-lg">
              {filteredFlights.length} flights found
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-xl text-gray-600">Loading flights...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 max-w-md mx-auto">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <strong className="font-bold">Error:</strong>
                <p className="text-sm mt-1">{error}</p>
              </div>
              <button 
                onClick={() => dispatch(fetchFlights())} 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Outbound Flight Selection (One Way or start of Round Trip) */}
              {!selectingReturn && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">
                    {searchForm.tripType === 'roundtrip' ? 'Select Outbound Flight' : 'Available Flights'}
                  </h2>
                  {filteredFlights.length === 0 ? (
                    <div className="text-gray-500">No flights found.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredFlights.map(flight => (
                        <FlightCard
                          key={flight.id}
                          flight={flight}
                          onSelect={handleSelectFlight}
                          buttonLabel={searchForm.tripType === 'roundtrip' ? 'Select Outbound' : 'Book'}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Return Flight Selection (Round Trip) */}
              {selectingReturn && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">Select Return Flight</h2>
                  {/* Outbound summary */}
                  {selectedOutbound && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="font-semibold">Selected Outbound:</div>
                      <div>{selectedOutbound.from_airport} → {selectedOutbound.to_airport} | {selectedOutbound.airline} {selectedOutbound.flight_number} | Departure: {selectedOutbound.departure_time.slice(0, 16).replace('T', ' ')}</div>
                    </div>
                  )}
                  {returnOptions.length === 0 ? (
                    <div className="text-gray-500">No return flights found for the selected date and route.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {returnOptions.map(flight => (
                        <FlightCard
                          key={flight.id}
                          flight={flight}
                          onSelect={handleSelectFlight}
                          buttonLabel="Select Return"
                          buttonColor="bg-purple-600 hover:bg-purple-700"
                        />
                      ))}
                    </div>
                  )}
                  <button
                    className="mt-6 text-blue-600 hover:underline"
                    onClick={() => { setSelectingReturn(false); setSelectedOutbound(null); setReturnOptions([]); }}
                  >
                    &larr; Back to Outbound Flights
                  </button>
                </div>
              )}
            </>
          )}

          {filteredFlights.length === 0 && !loading && !error && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.5 0-4.847-.655-6.879-1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No flights found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default HomePage 