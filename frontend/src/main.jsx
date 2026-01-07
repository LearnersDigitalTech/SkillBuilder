import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { QuizSessionProvider } from './contexts/QuizSessionContext.jsx'
import { Toaster } from 'react-hot-toast'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <QuizSessionProvider>
                    <App />
                    <Toaster position="top-right" />
                </QuizSessionProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>,
)
