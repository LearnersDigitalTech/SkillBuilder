"use client";
import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PracticeSession from "./PracticeSession";
import LoadingScreen from "@/components/LoadingScreen/LoadingScreen.component";
import getRandomInt from "@/app/workload/GetRandomInt";

const GRADE_LOADERS = {
    1: () => import('@/questionBook/Grade1/GetGrade1Question'),
    2: () => import('@/questionBook/Grade2/GetGrade2Question.mjs'),
    3: () => import('@/questionBook/Grade3/GetGrade3Question.mjs'),
    4: () => import('@/questionBook/Grade4/GetGrade4Question.mjs'),
    5: () => import('@/questionBook/Grade5/GetGrade5Question.mjs'),
    6: () => import('@/questionBook/Grade6/GetGrade6Question.mjs'),
    7: () => import('@/questionBook/Grade7/GetGrade7Question.mjs'),
    8: () => import('@/questionBook/Grade8/GetGrade8Question.mjs'),
    9: () => import('@/questionBook/Grade9/GetGrade9Question.mjs'),
    10: () => import('@/questionBook/Grade10/GetGrade10Question.mjs'),
};

const PracticeClientContent = () => {
    const searchParams = useSearchParams();
    const gradeParam = searchParams.get('grade');
    const grade = gradeParam ? parseInt(gradeParam) : 1;
    const [questions, setQuestions] = useState(null);
    const [generatorMap, setGeneratorMap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setQuestions(null);
            setError(null);

            const loader = GRADE_LOADERS[grade];
            if (!loader) {
                setLoading(false);
                return;
            }

            try {
                const module = await loader();
                const questionBook = module.default;
                const map = module[`Grade${grade}GeneratorMap`];

                if (!questionBook) {
                    throw new Error(`No question book found for Grade ${grade}`);
                }

                // Flatten the Question Book into a Session Paper
                const generatedPaper = [];
                let qIndex = 1;
                while (questionBook[`q${qIndex}`]) {
                    const qs = questionBook[`q${qIndex}`];
                    if (qs && qs.length > 0) {
                        const randomInt = getRandomInt(0, qs.length - 1);
                        generatedPaper.push({ ...qs[randomInt], userAnswer: null });
                    }
                    qIndex++;
                }

                if (generatedPaper.length === 0) {
                    console.warn("Generated paper is empty", questionBook);
                }

                setQuestions(generatedPaper);
                setGeneratorMap(map);
            } catch (err) {
                console.error("Failed to load grade data", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [grade]);

    if (error) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
                <h2>Error Loading Grade {grade}</h2>
                <p>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    style={{ padding: '0.5rem 1rem', marginTop: '1rem', cursor: 'pointer' }}
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!loading && !questions) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Grade {grade} Practice</h2>
                <p>Coming Soon!</p>
            </div>
        );
    }

    if (loading) {
        return <LoadingScreen title={`Loading Grade ${grade} Practice`} />;
    }

    return (
        <PracticeSession
            initialQuestions={questions}
            generatorMap={generatorMap}
            gradeTitle={`Grade ${grade} Practice`}
        />
    );
};

const PracticeClient = () => {
    return (
        <Suspense fallback={<LoadingScreen title="Loading Practice Mode" />}>
            <PracticeClientContent />
        </Suspense>
    );
};

export default PracticeClient;
