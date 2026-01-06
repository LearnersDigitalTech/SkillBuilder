import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

export default function ResultsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: result, isLoading } = useQuery({
        queryKey: ['quizResult', id],
        queryFn: async () => {
            const response = await apiClient.get(`/quiz/results/${id}`);
            return response.data.data.result;
        },
        enabled: !!id
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading results...</div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Results not found</h2>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const correctAnswers = result.answers.filter((a: any) => a.isCorrect).length;
    const percentage = Math.round((correctAnswers / result.totalQuestions) * 100);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-8 mb-6 text-center">
                    <h1 className="text-4xl font-bold mb-4">Quiz Results</h1>
                    <div className="text-6xl font-bold text-blue-600 mb-2">
                        {percentage}%
                    </div>
                    <p className="text-xl text-gray-600">
                        {correctAnswers} out of {result.totalQuestions} correct
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                            {correctAnswers}
                        </div>
                        <div className="text-gray-600">Correct Answers</div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-red-600 mb-2">
                            {result.totalQuestions - correctAnswers}
                        </div>
                        <div className="text-gray-600">Incorrect Answers</div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                            {Math.floor(result.timeSpent / 60)}:{(result.timeSpent % 60).toString().padStart(2, '0')}
                        </div>
                        <div className="text-gray-600">Time Spent</div>
                    </div>
                </div>

                {/* Performance Analysis */}
                <div className="bg-white rounded-lg shadow-md p-8 mb-6">
                    <h2 className="text-2xl font-semibold mb-4">Performance Analysis</h2>

                    <div className="mb-4">
                        <div className="flex justify-between mb-2">
                            <span>Overall Score</span>
                            <span className="font-semibold">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                                className={`h-4 rounded-full ${percentage >= 80 ? 'bg-green-500' :
                                        percentage >= 60 ? 'bg-yellow-500' :
                                            'bg-red-500'
                                    }`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        {percentage >= 80 ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h3 className="font-semibold text-green-800 mb-2">Excellent Performance! 🎉</h3>
                                <p className="text-green-700">
                                    You have demonstrated strong understanding of the concepts. Keep up the great work!
                                </p>
                            </div>
                        ) : percentage >= 60 ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h3 className="font-semibold text-yellow-800 mb-2">Good Effort! 👍</h3>
                                <p className="text-yellow-700">
                                    You're on the right track. Review the topics you missed and practice more.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <h3 className="font-semibold text-red-800 mb-2">Keep Practicing! 💪</h3>
                                <p className="text-red-700">
                                    Don't worry! With more practice and review, you'll improve. Focus on understanding the concepts.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => navigate('/quiz')}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Take Another Quiz
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
