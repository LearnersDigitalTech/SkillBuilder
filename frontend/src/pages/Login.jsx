/**
 * Login Page with AuthModal
 * Updated to use migrated AuthModal component
 */
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import AuthModal from '@/components/AuthModal/AuthModal'

export default function Login() {
    const [showModal, setShowModal] = useState(true)
    const { user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const from = location.state?.from?.pathname || '/dashboard'

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate(from, { replace: true })
        }
    }, [user, navigate, from])

    const handleSuccess = (data) => {
        console.log('Login success:', data)
    }

    const handleClose = () => {
        // Navigate back to home if user closes modal
        navigate('/')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full max-w-md text-center"
            >
                {/* Background decoration when modal is open */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        SkillBuilder
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        National Mathematics Skills Proficiency Test
                    </p>
                </div>
            </motion.div>

            {/* Auth Modal */}
            <AuthModal
                open={showModal}
                onClose={handleClose}
                onSuccess={handleSuccess}
                redirectPath={from}
            />
        </div>
    )
}
