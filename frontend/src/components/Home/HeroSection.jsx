/**
 * HeroSection Component
 * Landing page hero with animations and CTAs - migrated from Next.js
 */
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import styles from './HeroSection.module.css'

export default function HeroSection() {
    const navigate = useNavigate()

    return (
        <section className={styles.hero}>
            {/* Decorative floating elements */}
            <div className={styles.decorations}>
                <motion.div
                    className={`${styles.floatingCircle} ${styles.circle1}`}
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className={`${styles.floatingCircle} ${styles.circle2}`}
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                />
                <motion.div
                    className={`${styles.floatingCircle} ${styles.circle3}`}
                    animate={{ y: [0, -25, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                />
            </div>

            <div className={styles.container}>
                <motion.div
                    className={styles.content}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                    {/* Main headline */}
                    <motion.h1
                        className={styles.headline}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        <span className={styles.headlineBlue}>Discover Your Child's</span>
                        <br />
                        <span className={styles.headlineAccent}>Math Superpowers</span>
                    </motion.h1>

                    {/* Sub-headline */}
                    <motion.p
                        className={styles.subheadline}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        A joyful experience that helps children feel confident about Math.
                    </motion.p>

                    {/* Audience */}
                    <motion.p
                        className={styles.audience}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        For students in Grades 1–10, any board, any skill level.
                    </motion.p>

                    {/* Assurance strip */}
                    <motion.div
                        className={styles.assuranceStrip}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                    >
                        {[
                            { title: 'Love', subtitle: 'to Discover.' },
                            { title: 'Learn', subtitle: 'to Build.' },
                            { title: 'Grow', subtitle: 'Confidence.' },
                        ].map((item, index) => (
                            <div key={index} className={styles.assuranceItem}>
                                {index > 0 && <div className={styles.assuranceDivider} />}
                                <div className={styles.assuranceContent}>
                                    <h3 className={styles.assuranceTitle}>{item.title}</h3>
                                    <p className={styles.assuranceSubtitle}>{item.subtitle}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Desktop CTA */}
                    <motion.div
                        className={styles.ctaDesktop}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                    >
                        <button
                            onClick={() => navigate('/lottery')}
                            className={styles.ctaButton}
                        >
                            Get Your Lucky Number
                            <motion.span
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <ArrowRight size={18} />
                            </motion.span>
                        </button>
                    </motion.div>
                </motion.div>
            </div>

            {/* Bottom wave */}
            <div className={styles.wave}>
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
                        fill="white"
                    />
                </svg>
            </div>

            {/* Mobile sticky CTA */}
            <motion.div
                className={styles.ctaMobile}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
            >
                <button
                    onClick={() => navigate('/lottery')}
                    className={styles.ctaMobileButton}
                >
                    Get Your Lucky Number
                    <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        →
                    </motion.span>
                </button>
            </motion.div>
        </section>
    )
}
