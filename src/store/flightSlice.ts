import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabase';
import { saveFlightsToCache } from '../lib/indexedDb';

export interface FlightCabin {
  id: string;
  flight_id: string;
  cabin_class: string;
  price: number;
  available_seats: number;
  total_seats: number;
}

export interface Flight {
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

interface FlightsState {
  flights: Flight[];
  loading: boolean;
  error: string | null;
}

const initialState: FlightsState = {
  flights: [],
  loading: false,
  error: null,
};

export const fetchFlights = createAsyncThunk<Flight[], void, { rejectValue: string }>(
  'flights/fetchFlights',
  async (_, { rejectWithValue }) => {

    const { data: flights, error: flightsError } = await supabase.from('flights').select('*');
    console.log("Flights Data:", flights, "Flights Error:", flightsError);

    if (flightsError) return rejectWithValue(flightsError.message || 'Failed to fetch flights');
    if (!flights || !Array.isArray(flights) || flights.length === 0) {
      return rejectWithValue('Flights data is invalid or empty');
    }

    const { data: cabins, error: cabinsError } = await supabase.from('flight_cabins').select('*');
    console.log("Cabins Data:", cabins, "Cabins Error:", cabinsError);

    if (cabinsError) return rejectWithValue(cabinsError.message || 'Failed to fetch cabins');
    if (!cabins || !Array.isArray(cabins)) {
      return rejectWithValue('Cabins data is invalid or empty');
    }

    const flightsWithCabins = flights.map((flight: any) => ({
      ...flight,
      cabins: cabins.filter((cabin: any) => cabin.flight_id === flight.id),
    }));

    await saveFlightsToCache(flightsWithCabins);
    return flightsWithCabins;
  }
);

const flightSlice = createSlice({
  name: 'flights',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFlights.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log("⏳ Fetching flights...");
      })
      .addCase(fetchFlights.fulfilled, (state, action) => {
        console.log("✅ Flights fetched successfully:", action.payload);
        state.loading = false;
        state.flights = action.payload;
        state.error = null;
      })
      .addCase(fetchFlights.rejected, (state, action) => {
        console.error("❌ Flights fetch failed:", action.payload);
        state.loading = false;
        state.error = action.payload || 'Unknown error';
      });
  },
});

export default flightSlice.reducer;
