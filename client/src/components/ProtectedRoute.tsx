import { Navigate, Outlet } from 'react-router'

/**
 * Wraps any route that requires authentication.
 * - Reads the JWT from localStorage.
 * - If missing → redirects to /login (replace so back-button doesn't loop).
 * - If present → renders child routes via <Outlet />.
 *
 * Note: This is a client-side guard only. The real security lives in the
 * backend authenticate middleware. This just prevents unauthenticated users
 * from seeing the UI at all.
 */
const ProtectedRoute = () => {
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
