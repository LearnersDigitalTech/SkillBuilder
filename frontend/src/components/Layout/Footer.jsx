/**
 * Footer Component
 * Site footer with links and branding - migrated from Next.js
 */
import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.top}>
                    {/* Brand */}
                    <div className={styles.brand}>
                        <h3 className={styles.brandName}>SkillBuilder</h3>
                        <p className={styles.brandTagline}>
                            Discover Your Child's Math Superpowers
                        </p>
                    </div>

                    {/* Links */}
                    <div className={styles.linksGrid}>
                        <div className={styles.linkGroup}>
                            <h4>Practice</h4>
                            <Link to="/practice">Math Practice</Link>
                            <Link to="/rapid-math">Rapid Math</Link>
                            <Link to="/quiz">Assessments</Link>
                        </div>
                        <div className={styles.linkGroup}>
                            <h4>Exams</h4>
                            <Link to="/neet">NEET Prep</Link>
                            <Link to="/practice?grade=SAT">SAT Practice</Link>
                        </div>
                        <div className={styles.linkGroup}>
                            <h4>Company</h4>
                            <a href="https://learnersdigitaltech.com" target="_blank" rel="noopener noreferrer">
                                Learners Digital
                            </a>
                            <Link to="/lottery">Lottery</Link>
                        </div>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p className={styles.copyright}>
                        © {currentYear} Learners Digital. All rights reserved.
                    </p>
                    <p className={styles.initiative}>
                        An initiative by Learners Digital Technology
                    </p>
                </div>
            </div>
        </footer>
    )
}
