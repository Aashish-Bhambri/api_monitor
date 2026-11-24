import { Route, Routes } from 'react-router'
import LoginPage from './pages/LoginPage'
import './App.css'
import SignupPage from './pages/SignupPage'
import Dashboard from './pages/Dashboard'
import MonitorsPage from './pages/MonitorsPage'
import IncidentsPage from './pages/IncidentsPage'
import LogsPage from './pages/LogsPage'
import MainOutlet from './components/MainOutlet'
import ProtectedRoute from './components/ProtectedRoute'
import ApiTestPage from './pages/ApiTestPage'
import LandingPage from './pages/LandingPage'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/test" element={<ApiTestPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainOutlet />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/monitors" element={<MonitorsPage />} />
          <Route path="/incidents" element={<IncidentsPage />} />
          <Route path="/logs" element={<LogsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
