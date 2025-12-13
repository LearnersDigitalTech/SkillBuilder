"use client";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Grade1PracticeClient from "./Grade1/Grade1PracticeClient";
import LoadingScreen from "@/components/LoadingScreen/LoadingScreen.component";

const PracticeClientContent = () => {
    const searchParams = useSearchParams();
    const gradeParam = searchParams.get('grade');
    const grade = gradeParam ? parseInt(gradeParam) : 1;

    // Route based on grade
    if (grade === 1) {
        return <Grade1PracticeClient grade={`Grade ${grade}`} />;
    }

    // Fallback for future grades or invalid grades
    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Grade {grade} Practice</h2>
            <p>Coming Soon!</p>
        </div>
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
