"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Award, RefreshCcw, Home } from "lucide-react";
import Header from "@/app/homepage/Header";
import Styles from "./complete.module.css";

export default function PracticeCompletePage() {
    const router = useRouter();

    return (
        <div className={Styles.pageContainer}>
            <Header />

            <div className={Styles.contentWrapper}>
                <div className={Styles.card}>
                    <div className={Styles.iconWrapper}>
                        <Award size={48} color="#f59e0b" strokeWidth={2.5} />
                    </div>

                    <h1 className={Styles.title}>Great Job!</h1>
                    <p className={Styles.subtitle}>
                        You have successfully completed the practice session. Keep up the momentum!
                    </p>

                    <div className={Styles.buttonGroup}>
                        <button
                            className={`${Styles.actionButton} ${Styles.homeButton}`}
                            onClick={() => router.push('/')}
                        >
                            <Home size={18} />
                            Home
                        </button>
                        <button
                            className={`${Styles.actionButton} ${Styles.practiceButton}`}
                            onClick={() => router.push('/practice')}
                        >
                            <RefreshCcw size={18} />
                            Practice Again
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
