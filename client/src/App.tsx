import { Route, Routes, Navigate } from 'react-router'
import LoginPage from './pages/LoginPage'
import './App.css'
import SignupPage from './pages/SignupPage'
import Dashboard from './pages/Dashboard'
import MainOutlet from './components/MainOutlet'
import ProtectedRoute from './components/ProtectedRoute'
import ApiTestPage from './pages/ApiTestPage'

const App = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/test" element={<ApiTestPage />} />

      {/* Protected routes — redirect to /login if no token */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainOutlet />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
