import TeacherStudentView from "@/components/Dashboard/TeacherStudentView";
import { Suspense } from "react";

export const metadata = {
    title: "Student Performance - Teacher Dashboard",
    description: "View individual student performance and assessment history"
};

export default async function TeacherStudentPage({ params }) {
    const { studentId } = await params;
    return (
        <Suspense fallback={<div>Loading student data...</div>}>
            <TeacherStudentView studentUid={studentId} />
        </Suspense>
    );
}
