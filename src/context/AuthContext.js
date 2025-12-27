"use client";
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { auth, firebaseDatabase, getUserDatabaseKey } from "@/backend/firebaseHandler";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { get, ref } from "firebase/database";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    // Lazily initialize activeChildId from localStorage to avoid delay
    const [activeChildId, setActiveChildId] = useState(() => {
        if (typeof window !== "undefined") {
            try {
                // Check quizSession first as it is set by AuthModal
                const quizSession = window.localStorage.getItem("quizSession");
                if (quizSession) {
                    const parsed = JSON.parse(quizSession);
                    if (parsed?.userDetails?.activeChildId) {
                        return parsed.userDetails.activeChildId;
                    }
                }
            } catch (e) { }
        }
        return null;
    });
    const [activeChildLoading, setActiveChildLoading] = useState(true);
    const [loading, setLoading] = useState(true);

    // Compute active child from userData + activeChildId
    const activeChild = useMemo(() => {
        if (!userData?.children || !activeChildId) return null;
        return userData.children[activeChildId] || null;
    }, [userData, activeChildId]);

    // Function to fetch and normalize user data from Firebase
    const fetchUserData = async (currentUser) => {
        if (!currentUser) {
            setUserData(null);
            return;
        }

        try {
            // Get database key based on auth provider
            const userKey = getUserDatabaseKey(currentUser);
            const userRef = ref(firebaseDatabase, `NMD_2025/Registrations/${userKey}`);

            let snapshot;
            try {
                snapshot = await get(userRef);
            } catch (error) {
                console.warn("Primary key access failed, trying fallback...", error);
            }

            // Fallback: If UID access fails or returns empty, try email-based key (e.g., S1001)
            if ((!snapshot || !snapshot.exists()) && currentUser.email && currentUser.email.endsWith('@lgs.com')) {
                try {
                    const shortKey = currentUser.email.split('@')[0].toUpperCase();
                    const fallbackRef = ref(firebaseDatabase, `NMD_2025/Registrations/${shortKey}`);
                    snapshot = await get(fallbackRef);
                } catch (fallbackError) {
                    console.error("Fallback access also failed:", fallbackError);
                }
            }

            if (snapshot && snapshot.exists()) {
                const rawData = snapshot.val();

                // Normalize to support multiple child profiles per user.
                // Legacy shape: a single profile object at the root.
                // New shape: { parentPhone/parentEmail, authProvider, children: { childId: { ...profile } } }
                let normalizedData;
                if (rawData && rawData.children) {
                    // Even if children exist, ensure we expose parentPhone/phoneNumber at top level
                    // Fallback: If phoneNumber is missing at root, check if it was saved as parentPhone
                    const phone = rawData.phoneNumber || rawData.parentPhone || "";

                    normalizedData = {
                        ...rawData,
                        phoneNumber: phone,
                        parentPhone: phone
                    };
                } else if (rawData) {
                    // Legacy phone auth user - normalize
                    const phoneNumber = currentUser.phoneNumber ? currentUser.phoneNumber.slice(-10) : "";
                    normalizedData = {
                        parentPhone: phoneNumber,
                        authProvider: "phone",
                        children: {
                            default: rawData
                        }
                    };
                } else {
                    normalizedData = null;
                }

                setUserData(normalizedData);
            } else {
                setUserData(null); // User authenticated but profile not created yet
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            setUserData(null);
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
            setActiveChildId(null);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            userData,
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
