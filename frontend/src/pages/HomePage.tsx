import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import AuthModal from '@/components/Auth/AuthModal';
import Styles from './HomePage.module.css';

export default function HomePage() {
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    return (
        <main className="overflow-hidden">
            {/* Hero Section */}
            <section className={Styles.heroContainer}>
                <div className={Styles.heroInner}>
                    <div className={Styles.contentContainer}>
                        <div className={Styles.titleSection}>
                            <p className={Styles.nationalMathDay}>NATIONAL MATHEMATICS DAY</p>
                            <p className={Styles.tagline}>December 22, 2024</p>
                        </div>

                        <h1>Discover Your Child's Math Superpowers</h1>

                        <p className={Styles.subtitle}>
                            A joyful, pressure-free experience for Grades 1-10 that helps children feel confident about numbers.
                        </p>

                        <div className={Styles.badgesContainer}>
                            <div className={Styles.badge}>
                                <svg className={Styles.badgeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>No Stress</span>
                            </div>
                            <div className={Styles.badge}>
                                <svg className={Styles.badgeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>No Judgment</span>
                            </div>
                            <div className={Styles.badge}>
                                <svg className={Styles.badgeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>No Competition</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setAuthModalOpen(true)}
                            style={{
                                background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)',
                                color: 'white',
                                padding: '1rem 2rem',
                                fontSize: '1.125rem',
                                fontWeight: 600,
                                borderRadius: '0.5rem',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.1), 0 2px 4px -1px rgba(37, 99, 235, 0.06)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #0369a1 100%)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(37, 99, 235, 0.2), 0 4px 6px -2px rgba(37, 99, 235, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(37, 99, 235, 0.1), 0 2px 4px -1px rgba(37, 99, 235, 0.06)';
                            }}
                        >
                            Start Your Assessment →
                        </button>

                        <div className={Styles.featuresContainer}>
                            <div className={Styles.featureItem}>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p>20-30 minutes</p>
                            </div>
                            <div className={Styles.featureItem}>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p>Instant Results</p>
                            </div>
                            <div className={Styles.featureItem}>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <p>Personalized Report</p>
                            </div>
                        </div>
                    </div>

                    <div className={Styles.illustrationContainer}>
                        <img
                            src="/hero-illustration.svg"
                            alt="Math Learning"
                            style={{ maxWidth: '100%', height: 'auto' }}
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section style={{ padding: '4rem 5%', backgroundColor: '#f0f9ff' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: '2.5rem',
                        fontWeight: 800,
                        textAlign: 'center',
                        marginBottom: '3rem',
                        background: 'linear-gradient(to right, #1e40af, #0ea5e9)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Why Choose SkillBuilder?
                    </h2>

                    <div className={Styles.whyChooseUsContainer}>
                        {[
                            { icon: '📊', title: 'Detailed Reports', desc: 'Get comprehensive analysis of your math skills with personalized learning recommendations' },
                            { icon: '🎯', title: 'Grade-wise Tests', desc: 'Customized assessments for grades 1-12 aligned with curriculum standards' },
                            { icon: '⚡', title: 'Instant Results', desc: 'Receive immediate feedback and track your progress over time' },
                            { icon: '🏆', title: 'Performance Tracking', desc: 'Monitor improvement with detailed analytics and progress charts' },
                            { icon: '👨‍🏫', title: 'Expert Guidance', desc: 'Access to experienced tutors for personalized learning support' },
                            { icon: '🎓', title: 'Curriculum Aligned', desc: 'Questions designed to match your school syllabus and board requirements' },
                        ].map((item, index) => (
                            <div key={index}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                                <div>
                                    <h4>{item.title}</h4>
                                    <p>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section style={{
                padding: '5rem 5%',
                background: 'linear-gradient(135deg, #1e40af 0%, #0ea5e9 100%)',
                textAlign: 'center',
                color: 'white'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>
                        Ready to Discover Your Math Potential?
                    </h2>
                    <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
                        Join thousands of students who have improved their math skills with SkillBuilder
                    </p>
                    <button
                        onClick={() => setAuthModalOpen(true)}
                        style={{
                            background: 'white',
                            color: '#1e40af',
                            padding: '1rem 2.5rem',
                            fontSize: '1.125rem',
                            fontWeight: 600,
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                        }}
                    >
                        Get Started Now →
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                padding: '3rem 5%',
                backgroundColor: '#1a202c',
                color: 'white',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <p style={{ fontSize: '1rem', opacity: 0.8 }}>
                        © 2024 SkillBuilder. All rights reserved.
                    </p>
                    <p style={{ fontSize: '0.875rem', opacity: 0.6, marginTop: '0.5rem' }}>
                        Empowering students to excel in mathematics
                    </p>
                </div>
            </footer>

            {/* Auth Modal */}
            <AuthModal
                open={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                redirectPath="/dashboard"
            />
        </main>
    );
}
