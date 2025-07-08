import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import Login from '../components/auth/Login'
import SignUp from '../components/auth/SignUp'
import HomePage from '../components/HomePage'
import ProfilePage from '../components/ProfilePage'
import BookingPage from '../components/BookingPage'
import CheckoutPage from '../components/CheckoutPage'
import NotFoundPage from '../components/NotFoundPage'
import Footer from '../components/layout/Footer'
import AdminLogin from '../components/admin/Login'
import AdminSignUp from '../components/admin/Signup'
import AdminDashboard from '../components/admin/Dashboard'
import ProtectedAdminRoute from '../components/auth/ProtectedAdminRoute'
import AddFlight from '../components/admin/AddFlight'
import BookingsList from '../components/admin/BookingsList'
import FlightsList from '../components/admin/FlightsList'
import PaymentsList from '../components/admin/PaymentsList'

const Layout = () => {
  const location = useLocation()

  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1">
        <Outlet />
      </div>
      {!isAdminRoute && <Footer />}
    </div>
  )
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/admin/login',
        element: <AdminLogin />
      },
      {
        path: '/admin/signup',
        element: <AdminSignUp />
      },
      {
        path: '/admin/add-flight',
        element:( 
          <ProtectedAdminRoute>
            <AddFlight />
          </ProtectedAdminRoute>
        )
      },
      {
        path: '/admin/bookings',
        element:( 
          <ProtectedAdminRoute>
            <BookingsList />
          </ProtectedAdminRoute>
        )
      },
      {
        path: '/admin/flights',
        element:( 
          <ProtectedAdminRoute>
            <FlightsList />
          </ProtectedAdminRoute>
        )
      },    
      {
        path: '/admin/payments',
        element:( 
          <ProtectedAdminRoute>
            <PaymentsList />
          </ProtectedAdminRoute>
        )
      },
      {
        path: '/admin/dashboard',
        element: (
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        )
      },
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/signup',
        element: <SignUp />
      },
      {
        path: '/home',
        element: (
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        )
      },
      {
        path: '/profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        )
      },
      {
        path: '/booking',
        element: (
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        )
      },
      {
        path: '/checkout',
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        )
      },
      {
        path: '/',
        element: <HomePage />,
        index: true
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
])

const AppRouter = () => {
  return <RouterProvider router={router} />
}

export default AppRouter 