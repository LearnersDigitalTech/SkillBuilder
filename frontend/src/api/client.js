/**
 * API Client
 * Axios wrapper with Firebase token injection
 */
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

class ApiClient {
    constructor() {
        this.client = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json'
            }
        })

        this.tokenGetter = null  // Function to get fresh token

        // Request interceptor to add auth header
        this.client.interceptors.request.use(
            async (config) => {
                // Get fresh token on each request
                if (this.tokenGetter) {
                    try {
                        const token = await this.tokenGetter()
                        if (token) {
                            config.headers.Authorization = `Bearer ${token}`
                        }
                    } catch (error) {
                        console.error('Error getting token:', error)
                    }
                }
                return config
            },
            (error) => Promise.reject(error)
        )

        // Response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Token expired or invalid - redirect to login
                    console.warn('Authentication failed, redirecting to login')
                    // Don't auto-redirect, let the component handle it
                }
                return Promise.reject(error)
            }
        )
    }

    // Set token getter function (called from AuthContext)
    setTokenGetter(getter) {
        this.tokenGetter = getter
    }

    // Legacy method for backward compatibility
    setToken(token) {
        this.tokenGetter = () => Promise.resolve(token)
    }

    clearToken() {
        this.tokenGetter = null
    }

    // HTTP methods
    get(url, config) {
        return this.client.get(url, config)
    }

    post(url, data, config) {
        return this.client.post(url, data, config)
    }

    patch(url, data, config) {
        return this.client.patch(url, data, config)
    }

    put(url, data, config) {
        return this.client.put(url, data, config)
    }

    delete(url, config) {
        return this.client.delete(url, config)
    }
}

export const apiClient = new ApiClient()

// ============ Auth API ============
export const authApi = {
    getProfile: () => apiClient.get('/auth/me'),
    register: (data) => apiClient.post('/auth/register', data),
    verifyToken: () => apiClient.post('/auth/verify')
}

// ============ Users API ============
export const usersApi = {
    getProfile: () => apiClient.get('/users/profile'),
    updateProfile: (data) => apiClient.patch('/users/profile', data),
    getChildren: () => apiClient.get('/users/children'),
    createChild: (data) => apiClient.post('/users/children', data),
    updateChild: (childId, data) => apiClient.patch(`/users/children/${childId}`, data),
    deleteChild: (childId) => apiClient.delete(`/users/children/${childId}`)
}

// ============ Quiz API ============
export const quizApi = {
    list: (params) => apiClient.get('/quiz', { params }),
    getGrades: () => apiClient.get('/quiz/grades'),
    getSubjects: (grade) => apiClient.get('/quiz/subjects', { params: { grade } }),
    getById: (quizId) => apiClient.get(`/quiz/${quizId}`),
    create: (data) => apiClient.post('/quiz', data),
    start: (data) => apiClient.post('/quiz/start', data),
    submit: (data) => apiClient.post('/quiz/submit', data),
    getResult: (attemptId) => apiClient.get(`/quiz/result/${attemptId}`),
    getResults: (quizId) => apiClient.get(`/quiz/${quizId}/results`),
    getHistory: (childId, limit) => apiClient.get('/quiz/attempts/history', { params: { child_id: childId, limit } })
}

// ============ Admin API ============
export const adminApi = {
    getStats: () => apiClient.get('/admin/stats'),
    getUsers: (params) => apiClient.get('/admin/users', { params }),
    getDashboardStats: () => apiClient.get('/admin/dashboard/stats'),
    listUsers: (params) => apiClient.get('/admin/users', { params }),
    listStudents: (params) => apiClient.get('/admin/students', { params }),
    updateUserType: (userId, newType) => apiClient.patch(`/admin/users/${userId}/type`, null, { params: { new_type: newType } })
}

// ============ Teacher API ============
export const teacherApi = {
    getProfile: () => apiClient.get('/teacher/profile'),
    getGrades: () => apiClient.get('/teacher/grades'),
    getStudents: (grade) => apiClient.get('/teacher/students', { params: { grade } }),
    getStudentReport: (childId) => apiClient.get(`/teacher/students/${childId}/report`)
}

// ============ Lottery API ============
export const lotteryApi = {
    register: (data) => apiClient.post('/lottery/register', data),
    getMyRegistration: () => apiClient.get('/lottery/my-registration'),
    checkTicket: (ticketCode) => apiClient.get(`/lottery/check/${ticketCode}`),
    getWinners: (prizeTier) => apiClient.get('/lottery/winners', { params: { prize_tier: prizeTier } })
}
