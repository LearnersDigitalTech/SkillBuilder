import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Pages (to be created)
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';

function App() {
    const { isAuthenticated } = useAuthStore();

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/dashboard"
                    element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />}
                />
                <Route
                    path="/quiz"
                    element={isAuthenticated ? <QuizPage /> : <Navigate to="/login" />}
                />
                <Route
                    path="/results/:id"
                    element={isAuthenticated ? <ResultsPage /> : <Navigate to="/login" />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
