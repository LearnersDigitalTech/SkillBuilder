/**
 * Auth Context
 * Handles Firebase authentication and user state
 */
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import {
    onAuthStateChanged,
    signOut,
    signInWithPopup,
    signInWithEmailAndPassword
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { apiClient } from '@/api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeChildId, setActiveChildId] = useState(null)

    // Computed values
    const activeChild = useMemo(() => {
        if (!userData?.children?.length || !activeChildId) return null
        return userData.children.find(c => c.id === activeChildId) || userData.children[0]
    }, [userData, activeChildId])

    const isTeacher = useMemo(() => {
        return userData?.user_type === 'teacher' || userData?.user_type === 'admin'
    }, [userData])

    const isAdmin = useMemo(() => {
        return userData?.user_type === 'admin'
    }, [userData])

    // Token getter function - provides fresh token on each request
    const getToken = useCallback(async () => {
        if (!auth.currentUser) return null
        try {
            return await auth.currentUser.getIdToken(true) // Force refresh
        } catch (error) {
            console.error('Error getting token:', error)
            return null
        }
    }, [])

    // Set up API client token getter when component mounts
    useEffect(() => {
        apiClient.setTokenGetter(getToken)
        return () => apiClient.clearToken()
    }, [getToken])

    // Fetch user data from backend
    const fetchUserData = async (firebaseUser) => {
        if (!firebaseUser) {
            setUserData(null)
            return
        }

        try {
            const response = await apiClient.get('/auth/me')
            setUserData(response.data)

            // Set default active child
            if (response.data?.children?.length > 0) {
                const savedChildId = localStorage.getItem(`activeChild_${firebaseUser.uid}`)
                const validChild = response.data.children.find(c => c.id === savedChildId)
                setActiveChildId(validChild?.id || response.data.children[0].id)
            }
        } catch (error) {
            console.error('Error fetching user data:', error)
            // User may need to register
            if (error.response?.status === 404 || error.response?.status === 401) {
                setUserData({ needsRegistration: true })
            }
        }
    }

    // Auth state listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser)

            if (firebaseUser) {
                await fetchUserData(firebaseUser)
            } else {
                setUserData(null)
            }

            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    // Update active child
    const updateActiveChild = (childId) => {
        setActiveChildId(childId)
        if (user) {
            localStorage.setItem(`activeChild_${user.uid}`, childId)
        }
    }

    // Refresh user data
    const refreshUserData = async () => {
        if (user) {
            await fetchUserData(user)
        }
    }

    // Login with Google
    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider)
            return result.user
        } catch (error) {
            console.error('Google login error:', error)
            throw error
        }
    }

    // Login with email/password
    const loginWithEmail = async (email, password) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password)
            return result.user
        } catch (error) {
            console.error('Email login error:', error)
            throw error
        }
    }

    // Logout
    const logout = async () => {
        try {
            await signOut(auth)
            setUser(null)
            setUserData(null)
            setActiveChildId(null)
            apiClient.clearToken()
        } catch (error) {
            console.error('Logout error:', error)
            throw error
        }
    }

    const value = {
        user,
        userData,
        loading,
        isTeacher,
        isAdmin,
        activeChild,
        activeChildId,
        setActiveChildId: updateActiveChild,
        refreshUserData,
        loginWithGoogle,
        loginWithEmail,
        logout
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
