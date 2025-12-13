import React from "react";
import Styles from "./MathClub.module.css";
import { Star, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const MathClub = ({ onStart }) => {
    const router = useRouter();

    return (
        <section className={Styles.container}>
            <div className={Styles.contentWrapper}>
                <div className={Styles.iconWrapper}>
                    <Star size={40} color="#FFD700" fill="#FFD700" />
                </div>
                <h2 className={Styles.title}>
                    Join the <span className={Styles.titleHighlight}>100% Math Club</span>
                </h2>
                <p className={Styles.description}>
                    Strive for excellence! We encourage all students to achieve <strong>100% proficiency</strong> in Basic Math Skills.
                    Practice regularly, master the concepts, and earn your place among the best.
                </p>
                <button
                    className={Styles.ctaButton}
                    onClick={onStart}
                >
                    Start Practicing <ArrowRight size={20} />
                </button>
            </div>
        </section>
    );
};

export default MathClub;
