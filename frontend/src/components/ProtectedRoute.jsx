/**
 * Protected Route Component
 * Handles authentication and role-based access
 */
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import LoadingScreen from './LoadingScreen'

export default function ProtectedRoute({
    children,
    requireTeacher = false,
    requireAdmin = false
}) {
    const { user, userData, loading, isTeacher, isAdmin } = useAuth()
    const location = useLocation()

    if (loading) {
        return <LoadingScreen />
    }

    // Not authenticated
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Check role requirements
    if (requireAdmin && !isAdmin) {
        return <Navigate to="/dashboard" replace />
    }

    if (requireTeacher && !isTeacher) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}
