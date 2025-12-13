import React from "react";
import Styles from "./SuccessStories.module.css";
import { Trophy } from "lucide-react";

const students = [
    {
        name: "Aradya mannvi",
        grade: "Grade 1",
        image: "/success/grade1/Aradya.jpg",
    },
    {
        name: "Mohammad mustaqim",
        grade: "Grade 1",
        image: "/success/grade1/Mohammad.jpg",
    },
    {
        name: "Chiranth  S Gowda",
        grade: "Grade 2",
        image: "/success/grade2/chiranth.jpg",
    },
    {
        name: "Sadruddin",
        grade: "Grade 2",
        image: "/success/grade2/sadruddin.jpg",
    },
    {
        name: "Sirishree G S",
        grade: "Grade 2",
        image: "/success/grade2/sirishree.jpg",
    },
    {
        name: "Tibah Tanveer",
        grade: "Grade 3",
        image: "/success/grade3/tibah.jpg",
    },
];

const SuccessStories = () => {
    // Duplicate the array to create a seamless infinite scroll effect
    const allStudents = [...students, ...students];

    return (
        <section className={Styles.container}>
            <h2 className={Styles.title}>Math Mastery Hall of Fame</h2>
            <p className={Styles.subtitle}>Recognizing students who demonstrated <span style={{ color: '#3c91f3', fontWeight: 'bold' }}>absolute precision</span> in our <span style={{ color: '#3c91f3', fontWeight: 'bold' }}>Basic Math Skills</span> assessment.</p>
            <div className={Styles.carouselContainer}>
                <div className={Styles.track}>
                    {allStudents.map((student, index) => (
                        <div key={index} className={Styles.card}>
                            <div className={Styles.imageContainer}>
                                <img
                                    src={student.image}
                                    alt={student.name}
                                    className={Styles.image}
                                    loading="lazy"
                                />
                            </div>
                            <div className={Styles.content}>
                                <h3 className={Styles.name}>{student.name}</h3>
                                <p className={Styles.grade}>{student.grade}</p>
                                <div className={Styles.badge}>
                                    <Trophy className={Styles.badgeIcon} />
                                    <span>100% Club</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SuccessStories;
