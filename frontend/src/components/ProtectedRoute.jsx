import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from './LoadingScreen'

export default function ProtectedRoute({ children, requireAdmin = false, requireApproved = false }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />

  if (!user) return <Navigate to="/login" replace />

  if (requireAdmin && !user.is_admin) {
    return <Navigate to="/dashboard" replace />
  }

  if (requireApproved) {
    if (user.approval_status === 'PENDING') return <Navigate to="/pending" replace />
    if (!user.can_access_dashboard) return <Navigate to="/pending" replace />
  }

  return children
}
