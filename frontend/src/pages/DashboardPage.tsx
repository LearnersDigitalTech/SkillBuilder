import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/api/client';

export default function DashboardPage() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    // Fetch user's quiz history
    const { data: quizHistory, isLoading } = useQuery({
        queryKey: ['quizHistory', user?.id],
        queryFn: async () => {
            if (!user?.children?.[0]?.id) return [];
            const response = await apiClient.get(`/quiz/history/${user.children[0].id}`);
            return response.data.data.results;
        },
        enabled: !!user?.children?.[0]?.id
    });

    const handleStartQuiz = () => {
        navigate('/quiz');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-blue-600">SkillBuilder</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-700">
                            {user?.children?.[0]?.name || user?.email || 'User'}
                        </span>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-3xl font-bold mb-6">
                    Welcome, {user?.children?.[0]?.name || 'Student'}!
                </h2>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div
                        onClick={handleStartQuiz}
                        className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition text-white"
                    >
                        <div className="text-4xl mb-4">📝</div>
                        <h3 className="text-2xl font-semibold mb-2">Start Quiz</h3>
                        <p className="text-blue-100">
                            Take a new mathematics assessment
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-lg shadow-md">
                        <div className="text-4xl mb-4">📊</div>
                        <h3 className="text-xl font-semibold mb-2">Quiz Results</h3>
                        <p className="text-gray-600">
                            {quizHistory?.length || 0} quizzes completed
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-lg shadow-md">
                        <div className="text-4xl mb-4">🎯</div>
                        <h3 className="text-xl font-semibold mb-2">Your Grade</h3>
                        <p className="text-gray-600">
                            {user?.children?.[0]?.grade || 'Not set'}
                        </p>
                    </div>
                </div>

                {/* Recent Quiz Results */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-2xl font-semibold mb-4">Recent Quiz Results</h3>

                    {isLoading ? (
                        <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : quizHistory && quizHistory.length > 0 ? (
                        <div className="space-y-4">
                            {quizHistory.map((result: any) => (
                                <div
                                    key={result.id}
                                    onClick={() => navigate(`/results/${result.id}`)}
                                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-semibold">{result.grade}</div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(result.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {result.score}%
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {result.totalQuestions} questions
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No quiz results yet. Start your first quiz!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
