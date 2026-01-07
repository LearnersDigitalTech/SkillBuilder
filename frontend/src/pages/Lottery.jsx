/**
 * Lottery Page
 * Registration and ticket display - migrated from Next.js
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Ticket, Star, Gift, ArrowRight, User, Phone, Mail, GraduationCap } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { lotteryApi } from '@/api/client'
import { Header, Footer } from '@/components/Layout'
import toast from 'react-hot-toast'
import styles from './Lottery.module.css'

export default function Lottery() {
    const navigate = useNavigate()
    const { user, userData } = useAuth()

    const [loading, setLoading] = useState(false)
    const [ticketCode, setTicketCode] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        grade: ''
    })

    // Check for existing registration
    useEffect(() => {
        if (userData?.ticket_code) {
            setTicketCode(userData.ticket_code)
        }
    }, [userData])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.name || !formData.phone || !formData.grade) {
            toast.error('Please fill in all required fields')
            return
        }

        setLoading(true)
        try {
            const response = await lotteryApi.register(formData)
            setTicketCode(response.data.ticket_code)
            toast.success('Registration successful!')
        } catch (error) {
            console.error('Registration error:', error)
            if (error.response?.data?.detail) {
                toast.error(error.response.data.detail)
            } else {
                toast.error('Registration failed. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.main}>
                <div className={styles.container}>
                    {/* Hero */}
                    <motion.div
                        className={styles.hero}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className={styles.heroIcon}>
                            <Ticket size={48} />
                        </div>
                        <h1 className={styles.heroTitle}>Get Your Lucky Number</h1>
                        <p className={styles.heroSubtitle}>
                            Register now for a chance to win exciting prizes!
                        </p>
                    </motion.div>

                    {/* Content */}
                    <motion.div
                        className={styles.content}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        {ticketCode ? (
                            // Ticket Display
                            <div className={styles.ticketCard}>
                                <div className={styles.ticketHeader}>
                                    <Star className={styles.starIcon} />
                                    <h2>Your Lucky Number</h2>
                                </div>
                                <div className={styles.ticketNumber}>{ticketCode}</div>
                                <p className={styles.ticketMessage}>
                                    Keep this number safe! You'll need it for the draw.
                                </p>
                                <div className={styles.ticketActions}>
                                    <button
                                        onClick={() => navigate('/dashboard')}
                                        className={styles.dashboardButton}
                                    >
                                        Go to Dashboard
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Registration Form
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <h2 className={styles.formTitle}>Register Now</h2>

                                <div className={styles.inputGroup}>
                                    <User className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Full Name *"
                                        className={styles.input}
                                        required
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <Phone className={styles.inputIcon} />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="Phone Number *"
                                        className={styles.input}
                                        required
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <Mail className={styles.inputIcon} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Email (optional)"
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <GraduationCap className={styles.inputIcon} />
                                    <select
                                        name="grade"
                                        value={formData.grade}
                                        onChange={handleInputChange}
                                        className={styles.select}
                                        required
                                    >
                                        <option value="">Select Grade *</option>
                                        {[...Array(12)].map((_, i) => (
                                            <option key={i + 1} value={`Grade ${i + 1}`}>
                                                Grade {i + 1}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                    disabled={loading}
                                >
                                    {loading ? 'Registering...' : 'Get My Lucky Number'}
                                    {!loading && <Gift size={18} />}
                                </button>
                            </form>
                        )}
                    </motion.div>

                    {/* Features */}
                    <motion.div
                        className={styles.features}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>🎯</div>
                            <h3>Skill Assessment</h3>
                            <p>Test your math skills</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>🏆</div>
                            <h3>Win Prizes</h3>
                            <p>Exciting rewards await</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>📈</div>
                            <h3>Track Progress</h3>
                            <p>Monitor your growth</p>
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
