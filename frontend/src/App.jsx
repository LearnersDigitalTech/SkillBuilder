import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { Suspense, lazy } from 'react'

// Components
import LoadingScreen from './components/LoadingScreen'
import ProtectedRoute from './components/ProtectedRoute'

// Pages - Eagerly loaded
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

// Pages - Lazily loaded for better performance
const QuizAttempt = lazy(() => import('./pages/QuizAttempt'))
const QuizResult = lazy(() => import('./pages/QuizResult'))
const Practice = lazy(() => import('./pages/Practice'))
const Lottery = lazy(() => import('./pages/Lottery'))
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))

function App() {
    const { loading } = useAuth()

    if (loading) {
        return <LoadingScreen />
    }

    return (
        <Suspense fallback={<LoadingScreen />}>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/lottery" element={<Lottery />} />
                <Route path="/practice" element={<Practice />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />

                {/* Quiz Routes */}
                <Route path="/quiz" element={
                    <ProtectedRoute>
                        <QuizAttempt />
                    </ProtectedRoute>
                } />

                <Route path="/quiz/result/:attemptId" element={
                    <ProtectedRoute>
                        <QuizResult />
                    </ProtectedRoute>
                } />

                {/* Teacher Dashboard Routes */}
                <Route path="/teacher-dashboard" element={
                    <ProtectedRoute requireTeacher>
                        <TeacherDashboard />
                    </ProtectedRoute>
                } />

                <Route path="/teacher/*" element={
                    <ProtectedRoute requireTeacher>
                        <TeacherDashboard />
                    </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin/*" element={
                    <ProtectedRoute requireAdmin>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    )
}

export default App
