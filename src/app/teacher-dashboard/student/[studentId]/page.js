import TeacherStudentView from "@/components/Dashboard/TeacherStudentView";

export const metadata = {
    title: "Student Performance - Teacher Dashboard",
    description: "View individual student performance and assessment history"
};

export default async function TeacherStudentPage({ params }) {
    const { studentId } = await params;
    return <TeacherStudentView studentUid={studentId} />;
}
