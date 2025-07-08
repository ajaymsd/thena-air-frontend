import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import { fetchProfile, updateProfile } from '../store/profileSlice'
import { fetchUserBookings } from '../services/bookingService'
import type { BookingData } from '../services/bookingService'
import toast from 'react-hot-toast'
import Header from './layout/Header'
import BookingList from './BookingList'

const ProfilePage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { profile, loading, error } = useSelector((state: RootState) => state.profile)

  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({ display_name: '', email: '', phone: '', address: '' })
  
  // Booking list state
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [bookingsError, setBookingsError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings'>('profile')

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchProfile(user.id))
    }
  }, [user, dispatch])

  // Fetch user bookings
  const loadBookings = async () => {
    if (!user?.id) return
    
    setBookingsLoading(true)
    setBookingsError(null)
    
    try {
      const userBookings = await fetchUserBookings(user.id)
      setBookings(userBookings)
    } catch (err: any) {
      setBookingsError(err.message || 'Failed to load bookings')
      toast.error('Failed to load bookings')
    } finally {
      setBookingsLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [user?.email])

  useEffect(() => {
    if (profile) {
      setEditData({
        display_name: profile.display_name || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
      })
    } else if (user) {
      setEditData((prev) => ({ ...prev, email: user.email || '' }))
    }
  }, [profile, user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value })
  }

  const handleEdit = () => {
    setEditMode(true)
  }

  const handleCancel = () => {
    setEditMode(false)
    if (profile) {
      setEditData({
        display_name: profile.display_name || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
      })
    } else if (user) {
      setEditData((prev) => ({ ...prev, email: user.email || '' }))
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return
    const result = await dispatch(updateProfile({
      id: user.id,
      ...editData,
      email: user.email || '',
    }) as any)
    setEditMode(false)
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Profile updated successfully!')
    } else {
      toast.error('Failed to update profile. Please try again.')
    }
  }

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-xl text-gray-700">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-1 py-12 px-4">
        <div className="w-full max-w-6xl mx-auto">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'bookings'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Bookings ({bookings.length})
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-8 mb-8">
                <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mb-4">
                    <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">
                    {profile?.display_name || 'No Name Set'}
                  </h2>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
                <div className="flex-1 w-full">
                  {editMode ? (
                    <form className="space-y-4" onSubmit={handleSave}>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                          value={editData.email}
                          readOnly
                          tabIndex={-1}
                        />
                      </div>
                      <div>
                        <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                        <input
                          id="display_name"
                          name="display_name"
                          type="text"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                          placeholder="Enter your display name"
                          value={editData.display_name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          id="phone"
                          name="phone"
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                          placeholder="Enter your phone number"
                          value={editData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea
                          id="address"
                          name="address"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                          placeholder="Enter your address"
                          value={editData.address}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow-md transition-colors duration-200"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg shadow-md transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="mb-6 w-full">
                        <div className="flex flex-col gap-2 text-gray-700">
                          <div><span className="font-semibold">Email:</span> {profile?.email || user?.email || <span className="text-gray-400">Not set</span>}</div>
                          <div><span className="font-semibold">Phone:</span> {profile?.phone || <span className="text-gray-400">Not set</span>}</div>
                          <div><span className="font-semibold">Address:</span> {profile?.address || <span className="text-gray-400">Not set</span>}</div>
                        </div>
                      </div>
                      <button
                        onClick={handleEdit}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 rounded-lg shadow-md transition-colors duration-200 mb-2"
                      >
                        Edit Profile
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">My Bookings</h2>
                  <p className="text-gray-600">Manage your flight bookings and payments</p>
                </div>
                <button
                  onClick={loadBookings}
                  disabled={bookingsLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                >
                  {bookingsLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </>
                  )}
                </button>
              </div>
              
              <BookingList 
                bookings={bookings}
                loading={bookingsLoading}
                error={bookingsError}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ProfilePage 