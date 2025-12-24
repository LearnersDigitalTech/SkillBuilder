import React from "react";
import Styles from "./SuccessStories.module.css";
import { Trophy } from "lucide-react";

const students = [
    // Grade 1
    { name: "Aditi Manu", grade: "Grade 1", image: "/success/grade1/Aditi Manu.jpeg" },
    { name: "Adiva Sajid Anwar", grade: "Grade 1", image: "/success/grade1/Adiva sajid anwar.jpeg" },
    { name: "Aradya Mannvi", grade: "Grade 1", image: "/success/grade1/Aradya.jpg" },
    { name: "Mohammad", grade: "Grade 1", image: "/success/grade1/Mohammad.jpg" },
    { name: "Mohammed Abdul Rahman", grade: "Grade 1", image: "/success/grade1/Mohammed Abdul Rahman.png" },
    { name: "Mohammed Mustaqim", grade: "Grade 1", image: "/success/grade1/Mohammed Mustaqim.png" },
    { name: "Yaduveer Rajpreeth", grade: "Grade 1", image: "/success/grade1/Yaduveer Rajpreeth.jpeg" },

    // Grade 2
    { name: "Chiranth S Gowda", grade: "Grade 2", image: "/success/grade2/chiranth.jpg" },
    { name: "Sadruddin", grade: "Grade 2", image: "/success/grade2/sadruddin.jpg" },
    { name: "Sirishree G S", grade: "Grade 2", image: "/success/grade2/sirishree.jpg" },

    // Grade 3
    { name: "Abhigna Manu", grade: "Grade 3", image: "/success/grade3/Abhigna Manu.png" },
    { name: "Charithrya", grade: "Grade 3", image: "/success/grade3/Charithrya.png" },
    { name: "Disha", grade: "Grade 3", image: "/success/grade3/Disha.png" },
    { name: "Himani", grade: "Grade 3", image: "/success/grade3/Himani.jpeg" },
    { name: "Sanjith S", grade: "Grade 3", image: "/success/grade3/Sanjith. S.jpeg" },
    { name: "Tibah Tanveer", grade: "Grade 3", image: "/success/grade3/tibah.jpg" },
    { name: "Tushitha", grade: "Grade 3", image: "/success/grade3/Tushitha .png" },

    // Grade 4
    { name: "Jhenkar K T", grade: "Grade 4", image: "/success/grade4/Jhenkar K T .png" },
    { name: "Mohammed Aswad Shaik", grade: "Grade 4", image: "/success/grade4/Mohammed Aswad shaik.png" },
    { name: "Poorav", grade: "Grade 4", image: "/success/grade4/Poorav.png" },

    // Grade 5
    { name: "Hiba Ameen", grade: "Grade 5", image: "/success/grade5/Hiba Ameen.png" },
    { name: "Mohith", grade: "Grade 5", image: "/success/grade5/Mohith.png" },

    // Grade 6
    { name: "Bhuavn", grade: "Grade 6", image: "/success/grade6/Bhuavn.png" },
    { name: "Manvith S", grade: "Grade 6", image: "/success/grade6/Manvith. S.png" },

    // Grade 7
    { name: "Dhanush", grade: "Grade 7", image: "/success/grade7/Dhanush .png" },
    { name: "Keerthana", grade: "Grade 7", image: "/success/grade7/Keerthana .png" },
    { name: "Kishan", grade: "Grade 7", image: "/success/grade7/Kishan.png" },
    { name: "Yashwanth", grade: "Grade 7", image: "/success/grade7/Yashwanth.png" },

    // Grade 8
    { name: "Uday Narayan", grade: "Grade 8", image: "/success/grade8/Uday Narayan .png" },

    // Grade 9
    { name: "Aleena Mohammadi", grade: "Grade 9", image: "/success/grade9/Aleena Mohammadi.png" },
    { name: "Disha N", grade: "Grade 9", image: "/success/grade9/Disha. N.png" },
    { name: "Yashaswini", grade: "Grade 9", image: "/success/grade9/Yashaswini .png" },

    // Grade 10
    { name: "Yoshita Konareddy", grade: "Grade 10", image: "/success/grade10/Yoshita Konareddy.png" },
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
