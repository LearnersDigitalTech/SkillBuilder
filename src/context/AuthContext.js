"use client";
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { auth, firebaseDatabase, getUserDatabaseKey } from "@/backend/firebaseHandler";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { get, ref } from "firebase/database";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userType, setUserType] = useState(null); // 'student', 'parent', 'teacher'
    const [activeChildId, setActiveChildId] = useState(null);
    const [activeChildLoading, setActiveChildLoading] = useState(true);
    const [loading, setLoading] = useState(true);

    // Compute active child from userData + activeChildId
    const activeChild = useMemo(() => {
        if (!userData?.children || !activeChildId) return null;
        return userData.children[activeChildId] || null;
    }, [userData, activeChildId]);

    // Compute if user is a teacher
    const isTeacher = useMemo(() => {
        return userType === 'teacher';
    }, [userType]);

    // Function to fetch and normalize user data from PostgreSQL API
    const fetchUserData = async (currentUser) => {
        if (!currentUser) {
            setUserData(null);
            setUserType(null);
            return;
        }

        try {
            // 1. Try Fetch by UID
            let items = null;
            let response = await fetch(`/api/users?uid=${currentUser.uid}`);

            if (response.ok) {
                const data = await response.json();
                if (data.users && data.users.length > 0) {
                    items = data.users[0];
                }
            }

            // 2. Fallback: Try Fetch by Email if not found by UID
            if (!items && currentUser.email) {
                response = await fetch(`/api/users?email=${currentUser.email}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.users && data.users.length > 0) {
                        items = data.users[0];
                    }
                }
            }

            if (items) {
                // Normalize Data from Postgres structure to App structure
                // Postgres 'teachers' table is separate. We might need to check role.

                const role = items.role; // 'teacher', 'parent', 'admin'

                // If teacher, we might need extra details from 'teachers' table?
                // The /api/users currently returns 'users' table columns.
                // We might need a separate call for teacher details OR join in the API.
                // For now, let's set basic data.

                const normalizedData = {
                    uid: items.uid,
                    name: items.email ? items.email.split('@')[0] : 'User', // Placeholder if name missing in users table
                    email: items.email,
                    phoneNumber: items.phone_number,
                    parentPhone: items.phone_number, // Legacy support
                    userType: role,
                    authProvider: currentUser.providerData?.[0]?.providerId || 'unknown',
                    children: {}
                };

                // Fetch Children if parent
                if (role === 'parent' || role === 'student') {
                    try {
                        const childRes = await fetch(`/api/users/${items.uid}/children`);
                        if (childRes.ok) {
                            const childData = await childRes.json();
                            normalizedData.children = childData.children || {};
                        }
                    } catch (e) {
                        console.error("Error fetching children:", e);
                    }
                }

                if (role === 'teacher') {
                    setUserType('teacher');
                    setUserData({ ...normalizedData, isTeacher: true });
                } else {
                    setUserType(role);
                    // For now, we unfortunately lack 'children' in this basic fetch.
                    // I will need to patch this to fetch children!
                    setUserData(normalizedData);
                }
            } else {
                setUserData(null);
                setUserType(null);
            }
        } catch (error) {
            console.error("Error fetching user data from API:", error);
            setUserData(null);
            setUserType(null);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            await fetchUserData(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Initialize activeChildId from localStorage when userData loads
    useEffect(() => {
        if (!user || !userData?.children) {
            setActiveChildLoading(false);
            return;
        }

        const userKey = getUserDatabaseKey(user);
        const storedChildId = typeof window !== "undefined"
            ? window.localStorage.getItem(`activeChild_${userKey}`)
            : null;

        const childKeys = Object.keys(userData.children);

        if (storedChildId && childKeys.includes(storedChildId)) {
            setActiveChildId(storedChildId);
        } else if (childKeys.length > 0) {
            // Default to first child
            setActiveChildId(childKeys[0]);
        }

        // Mark as loaded after initialization
        setActiveChildLoading(false);
    }, [user, userData]);

    // Function to update active child and persist to localStorage
    const updateActiveChild = (childId) => {
        setActiveChildId(childId);

        if (user && typeof window !== "undefined") {
            const userKey = getUserDatabaseKey(user);
            window.localStorage.setItem(`activeChild_${userKey}`, childId);
            window.localStorage.setItem('lastActiveChild', childId); // Generic fallback
        }
    };

    // Function to refresh user data from Firebase (can be called after updates)
    const refreshUserData = async () => {
        if (user) {
            await fetchUserData(user);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setUserData(null);
            setUserType(null);
            setActiveChildId(null);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            userData,
            userType,
            isTeacher,
            activeChild,
            activeChildId,
            activeChildLoading,
            setActiveChildId: updateActiveChild,
            loading,
            logout,
            setUserData,
            refreshUserData
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
