import TeacherDashboard from "@/components/Dashboard/TeacherDashboard";
import { Suspense } from "react";

export const metadata = {
    title: "Teacher Dashboard - Math Skills Proficiency Test",
    description: "View and monitor student performance across grades"
};

export default function TeacherDashboardPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TeacherDashboard />
        </Suspense>
    );
}
