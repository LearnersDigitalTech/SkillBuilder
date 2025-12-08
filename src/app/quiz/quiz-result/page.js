import { Suspense } from "react";
import QuizResultClient from "@/components/Quiz/QuizResultClient";
import { CircularProgress } from "@mui/material";

export const metadata = {
    title: "Quiz Results - Skill Conquest",
    description: "View your detailed math skill report and performance analysis.",
    robots: {
        index: false, // Results are private
        follow: false,
    },
};

export default function QuizResult() {
    return (
        <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </div>
        }>
            <QuizResultClient />
        </Suspense>
    );
}
