"use client";
import React, { useState, useEffect } from "react";
import Styles from "./Navigation.module.css";
import { Play, Phone, User } from 'lucide-react'
import { Tooltip } from "@mui/material";
import { useRouter } from "next/navigation";
import AuthModal from "../Auth/AuthModal.component";
import { useAuth } from "@/context/AuthContext";

const Navigation = () => {
    const [scrolled, setScrolled] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [hasSession, setHasSession] = useState(false);
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Check for active quiz session or stored child session
        const checkSession = () => {
            if (typeof window !== "undefined") {
                const quizSession = window.localStorage.getItem("quizSession");
                // functionality to check if user is logged in via firebase is handled by useAuth
                // but sometimes we want to show profile if we have local user details
                if (quizSession) {
                    try {
                        const parsed = JSON.parse(quizSession);
                        if (parsed?.userDetails) {
                            setHasSession(true);
                            return;
                        }
                    } catch (e) { }
                }
            }
            setHasSession(false);
        };
        checkSession();
    }, [user]);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);

    return (
        <>
            <div className={`${Styles.navigationContainer} ${scrolled ? Styles.scrolled : ''}`}>
                <div className={Styles.logoContainer} onClick={() => router.push("/")}>
                    <div className={Styles.brainWrap} aria-hidden>
                        <img src="/LearnersLogoTransparent.png" className={Styles.brainIcon} />
                    </div>
                    <div>
                        <h3 className={Styles.logoTitle}>Math Skill Conquest</h3>
                        {/* <p className={Styles.logoSubtitle}>Educational Assessment</p> */}
                    </div>
                </div>
                <div className={Styles.navActionContainer}>
                    <Tooltip title="Take Test" arrow>
                        <button
                            onClick={() => {
                                if (user) {
                                    router.push("/dashboard");
                                } else {
                                    setAuthModalOpen(true);
                                }
                            }}
                            style={{ backgroundColor: "#3c91f3ff", color: "white" }}
                            className={Styles.navButton}
                        >
                            <Play size={16} />
                            <span className={Styles.buttonText}>Take Test</span>
                        </button>
                    </Tooltip>

                    {user || hasSession ? (
                        <Tooltip title="View Dashboard" arrow>
                            <button onClick={() => router.push("/dashboard")} className={`${Styles.navButton} ${Styles.outlined}`}>
                                <User size={16} />
                                <span className={Styles.buttonText}>Profile</span>
                            </button>
                        </Tooltip>
                    ) : (
                        <Tooltip title="Sign In" arrow>
                            <button onClick={() => setAuthModalOpen(true)} className={`${Styles.navButton} ${Styles.outlined}`}>
                                <User size={16} />
                                <span className={Styles.buttonText}>Sign In</span>
                            </button>
                        </Tooltip>
                    )}

                    <Tooltip title="Reach out to us" arrow>
                        <button onClick={() => window.location.href = "tel:+919916933202"} className={`${Styles.navButton} ${Styles.outlined}`}>
                            <Phone size={16} />
                            <span className={Styles.buttonText}>Reach Us</span>
                        </button>
                    </Tooltip>
                </div>
            </div>
            <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        </>
    )
}

export default Navigation;