"use client";
import React from "react";
import Styles from "./LoadingScreen.module.css";

const LoadingScreen = ({
    title = "Loading...",
    subtitle = "Please wait while we prepare everything for you",
    variant = "default" // "default", "auth", "quiz"
}) => {
    return (
        <div className={Styles.loadingOverlay}>
            <div className={Styles.loadingContainer}>
                {/* Animated Logo/Icon */}
                <div className={Styles.logoContainer}>
                    <div className={Styles.mathSymbols}>
                        <span className={Styles.symbol}>+</span>
                        <span className={Styles.symbol}>−</span>
                        <span className={Styles.symbol}>×</span>
                        <span className={Styles.symbol}>÷</span>
                    </div>
                    <div className={Styles.pulseRing}></div>
                    <div className={Styles.pulseRing} style={{ animationDelay: '0.3s' }}></div>
                </div>

                {/* Loading Spinner */}
                <div className={Styles.spinnerContainer}>
                    <div className={Styles.spinner}>
                        <div className={Styles.spinnerDot}></div>
                        <div className={Styles.spinnerDot}></div>
                        <div className={Styles.spinnerDot}></div>
                    </div>
                </div>

                {/* Text Content */}
                <div className={Styles.textContent}>
                    <h2 className={Styles.title}>{title}</h2>
                    <p className={Styles.subtitle}>{subtitle}</p>
                </div>

                {/* Progress Bar */}
                <div className={Styles.progressContainer}>
                    <div className={Styles.progressBar}>
                        <div className={Styles.progressFill}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
