import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useSupervision } from './context/SupervisionContext'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Pending from './pages/Pending'
import SelectRoom from './pages/SelectRoom'
import Dashboard from './pages/Dashboard'
import IncidentDetail from './pages/IncidentDetail'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminApprovals from './pages/admin/AdminApprovals'
import AdminUsers from './pages/admin/AdminUsers'
import AdminSessions from './pages/admin/AdminSessions'
import AdminRooms from './pages/admin/AdminRooms'

function HomeRedirect() {
  const { user, loading } = useAuth()
  const { selectedHall } = useSupervision()

  if (loading) return null
  if (!user) return <Landing />
  if (user.is_admin) return <Navigate to="/admin" replace />
  if (user.approval_status === 'PENDING') return <Navigate to="/pending" replace />
  if (user.approval_status === 'REJECTED' || user.approval_status === 'SUSPENDED') {
    return <Navigate to="/pending" replace />
  }
  if (!selectedHall) return <Navigate to="/select-room" replace />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/home" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/pending" element={<Pending />} />
      <Route
        path="/select-room"
        element={
          <ProtectedRoute requireApproved>
            <SelectRoom />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireApproved>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/incidents/:id"
        element={
          <ProtectedRoute requireApproved>
            <IncidentDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/rooms"
        element={
          <ProtectedRoute requireAdmin>
            <AdminRooms />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/approvals"
        element={
          <ProtectedRoute requireAdmin>
            <AdminApprovals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requireAdmin>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sessions"
        element={
          <ProtectedRoute requireAdmin>
            <AdminSessions />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
