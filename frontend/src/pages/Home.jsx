/**
 * Home Page
 * Landing page with all sections - migrated from Next.js
 */
import { Header, Footer } from '@/components/Layout'
import { HeroSection } from '@/components/Home'
import styles from './Home.module.css'

export default function Home() {
    return (
        <div className={styles.page}>
            <Header />
            <main>
                <HeroSection />

                {/* Features Section */}
                <section className={styles.features}>
                    <div className={styles.container}>
                        <h2 className={styles.sectionTitle}>Why SkillBuilder?</h2>
                        <div className={styles.featuresGrid}>
                            <div className={styles.featureCard}>
                                <div className={styles.featureIcon}>📊</div>
                                <h3>Skill Assessment</h3>
                                <p>Understand your child's current math proficiency level</p>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureIcon}>🎯</div>
                                <h3>Personalized Practice</h3>
                                <p>Get questions tailored to your grade and skill level</p>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureIcon}>⚡</div>
                                <h3>Rapid Math</h3>
                                <p>Build speed and accuracy with timed challenges</p>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureIcon}>📈</div>
                                <h3>Progress Tracking</h3>
                                <p>Monitor improvement with detailed reports</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Grades Section */}
                <section className={styles.grades}>
                    <div className={styles.container}>
                        <h2 className={styles.sectionTitle}>For All Grades</h2>
                        <p className={styles.sectionSubtitle}>
                            From Grade 1 to Grade 10, we cover the complete math curriculum
                        </p>
                        <div className={styles.gradesList}>
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className={styles.gradeChip}>
                                    Grade {i + 1}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className={styles.cta}>
                    <div className={styles.container}>
                        <h2 className={styles.ctaTitle}>Ready to Start?</h2>
                        <p className={styles.ctaSubtitle}>
                            Take the first step towards math confidence
                        </p>
                        <a href="/lottery" className={styles.ctaButton}>
                            Get Your Lucky Number →
                        </a>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
