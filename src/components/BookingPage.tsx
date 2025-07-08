import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Header from './layout/Header';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
// Types for flight and passenger
interface FlightCabin {
  id: string;
  flight_id: string;
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
  cabins: FlightCabin[];
}

interface Passenger {
  name: string;
  age: string;
  gender: string;
  passenger_type?: 'Adult' | 'Child' | 'Infant';
  special_requests?: string;
  seat_preference?: string;
}

const steps = [
  'Passenger Details',
  'Contact Information',
  'Review & Confirm',
];

const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  console.log(user);
  const tripType = searchParams.get('tripType') as 'oneway' | 'roundtrip';
  const outboundFlightId = searchParams.get('outboundFlightId');
  const returnFlightId = searchParams.get('returnFlightId');
  const cabinClass = searchParams.get('cabinClass');
  const adults = parseInt(searchParams.get('adults') || '1');
  const children = parseInt(searchParams.get('children') || '0');
  const infants = parseInt(searchParams.get('infants') || '0');
  const [outboundFlight, setOutboundFlight] = useState<Flight | null>(null);
  const [returnFlight, setReturnFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [flightError, setFlightError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [passengers, setPassengers] = useState<Passenger[]>(() => {
    const totalPassengers = adults + children + infants;
    const passengerArray: Passenger[] = [];
    
    for (let i = 0; i < adults; i++) {
      passengerArray.push({ name: '', age: '', gender: '', passenger_type: 'Adult' });
    }
  
    for (let i = 0; i < children; i++) {
      passengerArray.push({ name: '', age: '', gender: '', passenger_type: 'Child' });
    }
    
   
    for (let i = 0; i < infants; i++) {
      passengerArray.push({ name: '', age: '', gender: '', passenger_type: 'Infant' });
    }
    
    return passengerArray;
  });
  const [contact, setContact] = useState({ email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Cabin class selection state
  const [outboundCabinClass, setOutboundCabinClass] = useState(cabinClass || 'Economy');
  const [returnCabinClass, setReturnCabinClass] = useState(cabinClass || 'Economy');

  // Validate required parameters and redirect if needed
  useEffect(() => {
    if (!tripType || !outboundFlightId || !cabinClass) {
      navigate('/home');
    }
  }, [tripType, outboundFlightId, cabinClass, navigate]);

  // Fetch flights from Supabase
  useEffect(() => {
    if (!tripType || !outboundFlightId || !cabinClass) return;

    const fetchFlights = async () => {
      try {
        setLoading(true);
        setFlightError(null);

        // Fetch outbound flight
        const { data: outboundData, error: outboundError } = await supabase
          .from('flights')
          .select(`
            *,
            cabins:flight_cabins(*)
          `)
          .eq('id', outboundFlightId)
          .maybeSingle();

        if (outboundError) throw outboundError;
        if (!outboundData) throw new Error('Outbound flight not found');

        let returnData = null;
        if (tripType === 'roundtrip' && returnFlightId) {
          const { data: returnFlightData, error: returnError } = await supabase
            .from('flights')
            .select(`
              *,
              cabins:flight_cabins(*)
            `)
            .eq('id', returnFlightId)
            .maybeSingle();

          if (returnError) throw returnError;
          if (!returnFlightData) throw new Error('Return flight not found');
          returnData = returnFlightData;
        }

        setOutboundFlight(outboundData);
        setReturnFlight(returnData);
      } catch (err: any) {
        setFlightError(err.message || 'Failed to fetch flight details');
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [outboundFlightId, returnFlightId, tripType, cabinClass]);

  // Passenger management functions
  const addPassenger = (type: 'Adult' | 'Child' | 'Infant' = 'Adult') => {
    setPassengers(prev => [...prev, { 
      name: '', 
      age: '', 
      gender: '', 
      passenger_type: type,
      special_requests: '',
      seat_preference: ''
    }]);
  };
  
  const removePassenger = (idx: number) => {
    setPassengers(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);
  };
  
  const handlePassengerChange = (idx: number, field: keyof Passenger, value: string) => {
    setPassengers(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContact({ ...contact, [e.target.name]: e.target.value });
  };

  // Update URL when step changes
  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('step', currentStep.toString());
    navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
  }, [currentStep, navigate, location.pathname, searchParams]);

  // Restore step from URL on page load
  useEffect(() => {
    const stepFromUrl = searchParams.get('step');
    if (stepFromUrl) {
      const step = parseInt(stepFromUrl);
      if (step >= 0 && step < steps.length) {
        setCurrentStep(step);
      }
    }
  }, [searchParams]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (flightError || !outboundFlight) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{flightError || 'Flight not found'}</p>
          <button onClick={() => navigate('/home')} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Price calculation
  const getCabin = (flight: Flight | null, cabinClass: string) => flight?.cabins.find(c => c.cabin_class === cabinClass);
  const outboundCabin = getCabin(outboundFlight, outboundCabinClass);
  const returnCabin = tripType === 'roundtrip' && returnFlight ? getCabin(returnFlight, returnCabinClass) : null;
  const totalPassengers = passengers.length;
  let totalPrice = 0;
  if (tripType === 'roundtrip' && outboundCabin && returnCabin) {
    totalPrice = (outboundCabin.price + returnCabin.price) * totalPassengers;
  } else if (tripType === 'oneway' && outboundCabin) {
    totalPrice = outboundCabin.price * totalPassengers;
  }

  // Booking submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    // Check if user is authenticated
    if (!user?.id) {
      setError('You must be logged in to create a booking');
      setSubmitting(false);
      return;
    }
    
    // Additional validation for user ID
    if (!user.id || user.id === '') {
      setError('Invalid user ID. Please log out and log back in.');
      setSubmitting(false);
      return;
    }
    
    try {
      // Debug: Log the booking data to see what's being sent
      console.log('User ID:', user.id);
      console.log('Trip Type:', tripType);
      console.log('Outbound Flight ID:', outboundFlight.id);
      console.log('Cabin Class:', outboundCabinClass);
      console.log('Contact Email:', contact.email);
      console.log('Contact Phone:', contact.phone);
      console.log('Total Price:', totalPrice);
      
      const bookingData: any = {
        user_id: user.id,
        trip_type: tripType,
        outbound_flight_id: outboundFlight.id,
        return_flight_id: tripType === 'roundtrip' && returnFlight ? returnFlight.id : null,
        cabin_class: outboundCabinClass,
        contact_email: contact.email,
        contact_phone: contact.phone,
        total_price: totalPrice,
        status: 'pending',
      };
      
      console.log('Final booking data:', bookingData);
      
      const { data: bookingResult, error: bookingError } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
        .single();
        
      if (bookingError) throw new Error(bookingError.message);
      
      // Then, create passenger records
      const passengerData = passengers.map((passenger, index) => ({
        booking_id: bookingResult.id,
        passenger_number: index + 1,
        full_name: passenger.name,
        age: parseInt(passenger.age),
        gender: passenger.gender,
        passenger_type: passenger.passenger_type || 'Adult',
        special_requests: passenger.special_requests || null,
        seat_preference: passenger.seat_preference || null,
      }));
      
      const { error: passengerError } = await supabase
        .from('passengers')
        .insert(passengerData);
        
      if (passengerError) throw new Error(passengerError.message);
      
      setSubmitting(false);
      
      navigate(`/checkout?bookingId=${bookingResult.id}`, { 
        state: { 
          bookingId: bookingResult.id,
          totalPrice 
        } 
      });
    } catch (err: any) {
      setSubmitting(false);
      setError(err.message || 'Failed to create booking. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
            <p className="text-gray-600">Fill in passenger details and contact information</p>
          </div>

          {/* Cabin Class Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cabin Class</label>
            {tripType === 'roundtrip' ? (
              <div className="flex flex-col md:flex-row gap-4">
                <div>
                  <span className="block text-xs text-gray-500 mb-1">Outbound</span>
                  <select
                    value={outboundCabinClass}
                    onChange={e => setOutboundCabinClass(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {outboundFlight?.cabins.map(cabin => (
                      <option key={cabin.id} value={cabin.cabin_class}>{cabin.cabin_class} (₹{cabin.price.toLocaleString()})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">Return</span>
                  <select
                    value={returnCabinClass}
                    onChange={e => setReturnCabinClass(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {returnFlight?.cabins.map(cabin => (
                      <option key={cabin.id} value={cabin.cabin_class}>{cabin.cabin_class} (₹{cabin.price.toLocaleString()})</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <select
                value={outboundCabinClass}
                onChange={e => setOutboundCabinClass(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {outboundFlight?.cabins.map(cabin => (
                  <option key={cabin.id} value={cabin.cabin_class}>{cabin.cabin_class} (₹{cabin.price.toLocaleString()})</option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content: Progressive step reveal */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <form onSubmit={handleSubmit} className="flex flex-col gap-10">
                  {/* Step 1: Passenger Details */}
                  <div className={`transition-all duration-300 ${currentStep >= 0 ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Passenger Details</h2>
                      <p className="text-gray-600">Enter information for all passengers traveling</p>
                    </div>
                    
                    <div className="space-y-8">
                      {passengers.map((p, idx) => (
                        <div key={idx} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                          {/* Passenger Header */}
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold text-lg">{idx + 1}</span>
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">Passenger {idx + 1}</h3>
                                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                    p.passenger_type === 'Adult' ? 'bg-blue-100 text-blue-700' :
                                    p.passenger_type === 'Child' ? 'bg-green-100 text-green-700' :
                                    'bg-purple-100 text-purple-700'
                                  }`}>
                                    {p.passenger_type}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removePassenger(idx)}
                                disabled={passengers.length === 1}
                                className="text-red-500 hover:text-red-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-50 disabled:opacity-40 transition-colors"
                                title="Remove Passenger"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          {/* Passenger Form */}
                          <div className="p-6 space-y-6">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              <div className="lg:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input 
                                  type="text" 
                                  required 
                                  placeholder="Enter full name as per ID" 
                                  value={p.name} 
                                  onChange={e => handlePassengerChange(idx, 'name', e.target.value)} 
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                                <input 
                                  type="number" 
                                  required 
                                  min="0" 
                                  max="150"
                                  placeholder="Age" 
                                  value={p.age} 
                                  onChange={e => handlePassengerChange(idx, 'age', e.target.value)} 
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                />
                              </div>
                            </div>
                            
                            {/* Additional Details */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                <select 
                                  required 
                                  value={p.gender} 
                                  onChange={e => handlePassengerChange(idx, 'gender', e.target.value)} 
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="">Select gender</option>
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Passenger Type</label>
                                <select 
                                  value={p.passenger_type || 'Adult'} 
                                  onChange={e => handlePassengerChange(idx, 'passenger_type', e.target.value)} 
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="Adult">Adult (12+)</option>
                                  <option value="Child">Child (3-11)</option>
                                  <option value="Infant">Infant (0-2)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Seat Preference</label>
                                <select 
                                  value={p.seat_preference || ''} 
                                  onChange={e => handlePassengerChange(idx, 'seat_preference', e.target.value)} 
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="">No preference</option>
                                  <option value="window">Window</option>
                                  <option value="aisle">Aisle</option>
                                  <option value="middle">Middle</option>
                                  <option value="front">Front</option>
                                  <option value="back">Back</option>
                                </select>
                              </div>
                            </div>
                            
                            {/* Special Requests */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                              <textarea 
                                placeholder="Dietary requirements, wheelchair assistance, medical needs, etc. (optional)" 
                                value={p.special_requests || ''} 
                                onChange={e => handlePassengerChange(idx, 'special_requests', e.target.value)} 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={3}
                              />
                              <p className="text-xs text-gray-500 mt-1">We'll do our best to accommodate your requests</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end gap-3 mt-8 items-center">
                      <div className="flex gap-2">
                        <button 
                          type="button" 
                          onClick={() => addPassenger('Adult')} 
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold px-4 py-3 rounded-lg text-sm flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add Adult
                        </button>
                        <button 
                          type="button" 
                          onClick={() => addPassenger('Child')} 
                          className="bg-green-100 hover:bg-green-200 text-green-700 font-semibold px-4 py-3 rounded-lg text-sm flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add Child
                        </button>
                        <button 
                          type="button" 
                          onClick={() => addPassenger('Infant')} 
                          className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold px-4 py-3 rounded-lg text-sm flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add Infant
                        </button>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setCurrentStep(1)} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg text-lg shadow-lg"
                      >
                        Continue
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Contact Info */}
                  <div className={`transition-all duration-300 ${currentStep >= 1 ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                    <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input 
                          type="email" 
                          required 
                          name="email" 
                          placeholder="Enter your email" 
                          value={contact.email} 
                          onChange={handleContactChange} 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input 
                          type="tel" 
                          required 
                          name="phone" 
                          placeholder="Enter your phone number" 
                          value={contact.phone} 
                          onChange={handleContactChange} 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-8 items-center">
                      <button 
                        type="button" 
                        onClick={() => setCurrentStep(2)} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg text-lg shadow-lg"
                      >
                        Continue
                      </button>
                    </div>
                  </div>

                  {/* Step 3: Review & Confirm */}
                  <div className={`transition-all duration-300 ${currentStep >= 2 ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                    <h2 className="text-2xl font-bold mb-6">Review & Confirm</h2>
                    
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Passenger Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {passengers.map((p, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium text-gray-900">Passenger {idx + 1}</div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  p.passenger_type === 'Adult' ? 'bg-blue-100 text-blue-700' :
                                  p.passenger_type === 'Child' ? 'bg-green-100 text-green-700' :
                                  'bg-purple-100 text-purple-700'
                                }`}>
                                  {p.passenger_type}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div><strong>Name:</strong> {p.name}</div>
                                <div><strong>Age:</strong> {p.age} • <strong>Gender:</strong> {p.gender}</div>
                                {p.seat_preference && (
                                  <div><strong>Seat Preference:</strong> {p.seat_preference}</div>
                                )}
                                {p.special_requests && (
                                  <div><strong>Special Requests:</strong> {p.special_requests}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{contact.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium">{contact.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 mt-8 items-center">
                      <button 
                        type="submit" 
                        disabled={submitting} 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold px-8 py-4 rounded-lg text-lg shadow-lg flex items-center gap-3"
                      >
                        {submitting ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <span>Confirm Booking</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Booking Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Booking Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trip Type</span>
                    <span className="font-semibold">{tripType === 'oneway' ? 'One Way' : 'Round Trip'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cabin Class</span>
                    <span className="font-semibold">{outboundCabinClass}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Passengers</span>
                    <span className="font-semibold">{passengers.length}</span>
                  </div>
                </div>

                {/* Flight Details */}
                <div className="border-t pt-6 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Flight Details</h4>
                  
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">Outbound</span>
                      <span className="text-sm text-blue-600">{outboundFlight.airline}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      {outboundFlight.flight_number} • {outboundFlight.from_airport} → {outboundFlight.to_airport}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(outboundFlight.departure_time).toLocaleDateString()} • {new Date(outboundFlight.departure_time).toLocaleTimeString()}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-blue-900">
                      ₹{outboundCabin?.price?.toLocaleString() || '-'} x {passengers.length}
                    </div>
                  </div>

                  {tripType === 'roundtrip' && returnFlight && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-900">Return</span>
                        <span className="text-sm text-purple-600">{returnFlight.airline}</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        {returnFlight.flight_number} • {returnFlight.from_airport} → {returnFlight.to_airport}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(returnFlight.departure_time).toLocaleDateString()} • {new Date(returnFlight.departure_time).toLocaleTimeString()}
                      </div>
                      <div className="mt-2 text-sm font-semibold text-purple-900">
                        ₹{returnCabin?.price?.toLocaleString() || '-'} x {passengers.length}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-6">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total Amount</span>
                    <span className="text-blue-600">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Including all taxes and fees</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingPage; 