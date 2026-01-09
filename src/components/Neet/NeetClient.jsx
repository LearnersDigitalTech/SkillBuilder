
"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { Atom, FlaskConical, Dna } from 'lucide-react';
import Styles from './NeetClient.module.css';
import { toast } from 'react-toastify';
import getRandomInt from "@/app/workload/GetRandomInt";
import { useAuth } from '@/context/AuthContext';
import { getUserDatabaseKey } from "@/backend/firebaseHandler";
import { getNeetQuestions } from '@/services/neetQuestionService';
import AuthModal from '@/components/Auth/AuthModal.component';
import { ref, get } from "firebase/database";
import { firebaseDatabase } from "@/backend/firebaseHandler";

const SUBJECT_LOADERS = {
    'Physics': () => import('@/questionBook/NEET/GetNeetPhysics.mjs'),
    'Chemistry': () => import('@/questionBook/NEET/GetNeetChemistry.mjs'),
    'Biology': () => import('@/questionBook/NEET/GetNeetBiology.mjs'),
};

const NeetClient = () => {
    const router = useRouter();
    const { user, userData, activeChildId } = useAuth();
    const [authModalOpen, setAuthModalOpen] = React.useState(false);

    const handleStartExam = async (subject) => {
        if (!user) {
            setAuthModalOpen(true);
            return;
        }
        try {
            // Fetch real questions from Firebase
            const actualQuestions = await getNeetQuestions(subject.toLowerCase());

            if (!actualQuestions || actualQuestions.length === 0) {
                alert(`No questions found for ${subject}. Please ask your teacher to upload questions.`);
                return;
            }

            // Shuffle questions to ensure randomness for each student
            const shuffled = [...actualQuestions].sort(() => Math.random() - 0.5);

            // Format questions for QuizClient
            const generatedPaper = shuffled.map(q => ({
                id: q.id,
                type: "mcq",
                question: q.question,
                options: q.options.map(opt => ({ label: opt, value: opt })),
                // Map 'A'/'B'/'C'/'D' to the actual text content of the option
                answer: q.options[q.correctAnswer.charCodeAt(0) - 65] || q.correctAnswer,
                solution: q.explanation || "",
                topic: subject,
                questionId: q.id,
                hint: "",
                // Preserve image data for questions with attached images
                image: q.imageUrl || q.image || null,
                imageUrl: q.imageUrl || null,
                hasImage: q.hasImage || !!q.imageUrl || !!q.image
            }));

            const userKey = user ? getUserDatabaseKey(user) : null;
            const childId = activeChildId || "default";

            console.log("[NeetClient] Path check - userKey:", userKey, "childId:", childId);

            // Construct userDetails - reusing existing structure if possible or making a minimal one
            // We need 'grade' to be set so QuizClient doesn't kick us out.
            // But QuizClient checks for specific grades. We might need to trick it or update QuizClient.
            const activeChild = userData?.children?.[childId];
            const studentName = activeChild?.name || userData?.name || user?.displayName || (user?.email ? user.email.split('@')[0] : "Student");

            // Calculate attempt count for NEET
            const finalUserKey = userKey.replace(/\./g, '_');
            const reportsRef = ref(firebaseDatabase, `NMD_2025/Reports/${finalUserKey}/${childId}`);
            const reportsSnapshot = await get(reportsRef);
            let neetAttemptCount = 0;
            if (reportsSnapshot.exists()) {
                const reportsData = reportsSnapshot.val();
                console.log("[NeetClient] Found reports data:", reportsData);

                // 1. Check for legacy root-level report
                if (reportsData.summary) {
                    const reportType = reportsData.type || (reportsData.summary?.grade?.startsWith('NEET') ? 'NEET' : 'ASSESSMENT');
                    if (reportType === 'NEET') neetAttemptCount++;
                }

                // 2. Check for sub-node reports
                Object.values(reportsData).forEach(r => {
                    if (r && typeof r === 'object' && r.summary) {
                        const reportType = r.type || (r.summary?.grade?.startsWith('NEET') ? 'NEET' : 'ASSESSMENT');
                        if (reportType === 'NEET') neetAttemptCount++;
                    }
                });
            }
            console.log("[NeetClient] Total NEET attempts found:", neetAttemptCount);

            const userDetails = {
                name: studentName,
                grade: `NEET ${subject}`, // This is just for display/logic, hope it doesn't break switch
                userKey: userKey,
                childId: childId,
                activeChildId: childId, // Explicitly pass activeChildId
                testType: 'NEET',
                activeChild: activeChild,
                attemptCount: neetAttemptCount + 1
            };
            console.log("[NeetClient] Starting with userDetails:", userDetails);

            const sessionData = {
                userDetails,
                questionPaper: generatedPaper,
                activeQuestionIndex: 0,
                remainingTime: 1800 // 30 mins
            };

            if (typeof window !== "undefined") {
                window.localStorage.setItem("quizSession", JSON.stringify(sessionData));
            }

            router.push('/quiz');

        } catch (error) {
            console.error("Failed to start NEET exam:", error);
            alert("Failed to start exam. Please try again.");
        }
    };

    const handleGuideClick = (subject) => {
        if (subject === 'Chemistry') {
            window.open('/assets/Neet/chemistry/chemistry_guide.pdf', '_blank');
            return;
        }
        // Placeholder for other subjects
        toast.info(`Opening ${subject} Guide...`);
        // router.push(`/neet/guide/${subject.toLowerCase()}`);
    };

    return (
        <div className={Styles.container}>
            <h1 className={Styles.title}>Select NEET Subject</h1>

            <div className={Styles.grid}>
                {/* Physics Card */}
                <div className={`${Styles.card} ${Styles.physicsCard}`}>
                    <div className={`${Styles.iconWrapper} ${Styles.physicsHeader}`}>
                        <Atom size={50} />
                    </div>
                    <h2 className={Styles.subjectName}>Physics</h2>
                    <p className={Styles.description}>
                        Master mechanics, thermodynamics, and electromagnetism.
                        Key for engineering and medical entrance.
                    </p>
                    <div className={Styles.buttonContainer}>
                        <button className={Styles.startButton} onClick={() => handleStartExam('Physics')}>
                            Start Physics
                        </button>
                        <button className={Styles.guideButton} onClick={() => handleGuideClick('Physics')}>
                            Guide
                        </button>
                    </div>
                </div>

                {/* Chemistry Card */}
                <div className={`${Styles.card} ${Styles.chemistryCard}`}>
                    <div className={`${Styles.iconWrapper} ${Styles.chemistryHeader}`}>
                        <FlaskConical size={50} />
                    </div>
                    <h2 className={Styles.subjectName}>Chemistry</h2>
                    <p className={Styles.description}>
                        Explore organic, inorganic, and physical chemistry.
                        Understanding matter and reactions.
                    </p>
                    <div className={Styles.buttonContainer}>
                        <button className={Styles.startButton} onClick={() => handleStartExam('Chemistry')}>
                            Start Chemistry
                        </button>
                        <button className={Styles.guideButton} onClick={() => handleGuideClick('Chemistry')}>
                            Guide
                        </button>
                    </div>
                </div>

                {/* Biology Card */}
                <div className={`${Styles.card} ${Styles.biologyCard}`}>
                    <div className={`${Styles.iconWrapper} ${Styles.biologyHeader}`}>
                        <Dna size={50} />
                    </div>
                    <h2 className={Styles.subjectName}>Biology</h2>
                    <p className={Styles.description}>
                        Study life, botany, and zoology.
                        Crucial for medical aspirants.
                    </p>
                    <div className={Styles.buttonContainer}>
                        <button className={Styles.startButton} onClick={() => handleStartExam('Biology')}>
                            Start Biology
                        </button>
                        <button className={Styles.guideButton} onClick={() => handleGuideClick('Biology')}>
                            Guide
                        </button>
                    </div>
                </div>
            </div>

            <AuthModal
                open={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                onSuccess={() => {
                    setAuthModalOpen(false);
                }}
            />
        </div>
    );
};

export default NeetClient;
