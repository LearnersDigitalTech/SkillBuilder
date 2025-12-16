"use client";
import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PracticeSession from "./PracticeSession";
import SATSession from "../SAT/SATSession";
import LoadingScreen from "@/components/LoadingScreen/LoadingScreen.component";
import getRandomInt from "@/app/workload/GetRandomInt";
import SATInstructions from "../SAT/SATInstructions.component";
import { useRouter } from "next/navigation";

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
    'SAT': () => import('@/questionBook/SAT/GetSATQuestion.mjs'),
};

const PracticeClientContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const gradeParam = searchParams.get('grade');
    let grade = 1;
    if (gradeParam === 'SAT') {
        grade = 'SAT';
    } else if (gradeParam) {
        grade = parseInt(gradeParam);
    }
    const [questions, setQuestions] = useState(null);
    const [generatorMap, setGeneratorMap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasStartedSAT, setHasStartedSAT] = useState(false);

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
                const mapKey = grade === 'SAT' ? 'GradeSATGeneratorMap' : `Grade${grade}GeneratorMap`;
                const map = module[mapKey];

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

    const getTitle = (g) => {
        if (g === 'SAT') return "SAT Practice";
        return `Grade ${g} Practice`;
    };

    if (error) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
                <h2>Error Loading {getTitle(grade)}</h2>
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
        if (grade === 'SAT' && !hasStartedSAT) {
            return (
                <SATInstructions
                    onStart={() => setHasStartedSAT(true)}
                    onExit={() => router.push('/')}
                />
            );
        }

        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>{getTitle(grade)}</h2>
                <p>Coming Soon!</p>
            </div>
        );
    }

    if (loading) {
        return <LoadingScreen title={`Loading ${getTitle(grade)}`} />;
    }

    if (grade === 'SAT') {
        return (
            <SATSession
                initialQuestions={questions}
                generatorMap={generatorMap}
                gradeTitle={getTitle(grade)}
            />
        );
    }

    return (
        <PracticeSession
            initialQuestions={questions}
            generatorMap={generatorMap}
            gradeTitle={getTitle(grade)}
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
