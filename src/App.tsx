import { AuthProvider } from './contexts/AuthContext'
import AppRouter from './router/AppRouter'

function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="flex-1">
          <AppRouter />
        </div>
      </div>
    </AuthProvider>
  )
}

export default App
