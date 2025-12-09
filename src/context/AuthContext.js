"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, firebaseDatabase, getUserDatabaseKey } from "@/backend/firebaseHandler";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { get, ref } from "firebase/database";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Fetch user details from Realtime Database
                try {
                    // Get database key based on auth provider
                    const userKey = getUserDatabaseKey(currentUser);
                    const userRef = ref(firebaseDatabase, `NMD_2025/Registrations/${userKey}`);
                    const snapshot = await get(userRef);

                    if (snapshot.exists()) {
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
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setUserData(null);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, logout, setUserData }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
