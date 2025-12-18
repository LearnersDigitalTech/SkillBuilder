"use client";
import { useState } from "react";
import Styles from "./Footer.module.css";
import { Facebook, Twitter, Linkedin, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import AuthModal from "../Auth/AuthModal.component";
import { useAuth } from "@/context/AuthContext";

const Footer = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [authModalOpen, setAuthModalOpen] = useState(false);

    return (
        <footer className={Styles.footer}>
            <div className={Styles.footerContent}>
                {/* Brand Section */}
                <div className={Styles.footerSection}>
                    <h3 className={Styles.footerBrand}>Math Skill Conquest</h3>
                    <p className={Styles.footerDescription}>
                        Empowering students with personalized math assessments and actionable insights for better learning outcomes.
                    </p>
                    <div className={Styles.socialLinks}>
                        <a href="https://www.facebook.com/Learnerspuc" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <Facebook size={20} />
                        </a>
                        {/* <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                            <Twitter size={20} />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                            <Linkedin size={20} />
                        </a> */}
                        <a href="https://www.instagram.com/learners.digital/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <Instagram size={20} />
                        </a>
                        <a href="https://www.youtube.com/channel/UCxetxBhvoIoaX0w8fAxdTRA" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                            <Youtube size={20} />
                        </a>
                    </div>
                </div>

                {/* Quick Links */}
                <div className={Styles.footerSection}>
                    <h4 className={Styles.footerTitle}>Quick Links</h4>
                    <ul className={Styles.footerList}>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); router.push("/"); }}>Home</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); router.push("/quiz"); }}>Take Test</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); router.push("/rapid-math"); }}>Rapid Math</a></li>
                        {/* <li><a href="#" onClick={(e) => { e.preventDefault(); router.push("/practice"); }}>Practice Mode</a></li> */}
                        <li><a href="#" onClick={(e) => {
                            e.preventDefault();
                            if (user) {
                                router.push("/practice?grade=SAT");
                            } else {
                                setAuthModalOpen(true);
                            }
                        }}>SAT</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); setAuthModalOpen(true); }}>Sign In</a></li>
                        <li><a href="tel:+919916933202">Reach Us</a></li>
                    </ul>
                </div>

                {/* Resources */}
                <div className={Styles.footerSection}>
                    <h4 className={Styles.footerTitle}>Resources</h4>
                    <ul className={Styles.footerList}>
                        <li><a href="https://learnersdigital.com/" target="_blank" rel="noopener noreferrer">Learners Digital</a></li>
                        <li><a href="https://learnersglobalschool.com/" target="_blank" rel="noopener noreferrer">Learners Global School</a></li>
                        <li><a href="https://learnerspuc.com/" target="_blank" rel="noopener noreferrer">Learners PU College</a></li>
                    </ul>
                </div>

                {/* Contact */}
                <div className={Styles.footerSection}>
                    <h4 className={Styles.footerTitle}>Contact Us</h4>
                    <ul className={Styles.footerContactList}>
                        <li>
                            <Mail size={16} />
                            <a href="mailto:connect@learnersdigital.com">connect@learnersdigital.com</a>
                        </li>
                        <li>
                            <Phone size={16} />
                            <a href="tel:+91 991 693 3202">+91 991 693 3202</a>
                        </li>
                        <li>
                            <MapPin size={16} />
                            <span>CA Site #01,Hanchya Main Rd, Sathagalli 2nd Stage, Mysuru, Karnataka 570019</span>
                        </li>
                        <li>
                            <MapPin size={16} />
                            <span>1152, 6th Main Road, Vijayanagar 1st Stage, Mysuru, Karnataka 570017</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className={Styles.footerBottom}>
                <p className={Styles.copyright}>
                    © 2024 Learners Digital. All rights reserved.
                </p>
                {/* <div className={Styles.footerBottomLinks}>
                    <a href="#privacy">Privacy Policy</a>
                    <span className={Styles.separator}>•</span>
                    <a href="#terms">Terms of Service</a>
                    <span className={Styles.separator}>•</span>
                    <a href="#cookies">Cookie Policy</a>
                </div> */}
            </div>
            <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        </footer>
    )
}

export default Footer;