"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, IconButton, CircularProgress, TextField, Button, Select, MenuItem, InputLabel, FormControl, Divider, InputAdornment } from "@mui/material";
import { X, Phone, User, GraduationCap, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup } from "firebase/auth";
import { auth, firebaseDatabase, googleProvider, getUserDatabaseKey } from "@/backend/firebaseHandler";
import { ref, set, get, update } from "firebase/database";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import Styles from "./AuthModal.module.css";
import LoadingScreen from "@/components/LoadingScreen/LoadingScreen.component";

const AuthModal = ({ open, onClose, onSuccess, redirectPath }) => {

    // Helper to handle final profile selection
    const handleSelectProfile = (childId, childProfile) => {
        // Validation: Ensure valid grade exists
        if (!childProfile.grade || childProfile.grade === "Select Grade" || childProfile.grade === "0") {
            // Force update flow
            setPendingProfileUpdate({ childId, childProfile });
            setRegistrationData({
                name: childProfile.name || "",
                grade: ""
            });
            setStep("REGISTER");
            toast.info("Please select your grade to continue.");
            return;
        }

        // Show loading screen immediately
        setProfileSelecting(true);

        // Construct user data
        const baseData = {
            parentPhone: phoneNumber || undefined,
            authProvider: phoneNumber ? 'phone' : 'google',
        };

        const finalUserData = {
            ...baseData,
            children: userProfiles,
            activeChildId: childId,
            activeChild: childProfile,
            userKey: childProfile?.uid || childProfile?.parentPhone || (auth.currentUser ? getUserDatabaseKey(auth.currentUser) : null)
        };

        if (!finalUserData.userKey && phoneNumber) {
            finalUserData.userKey = phoneNumber;
        }

        setUserData(finalUserData);
        // Explicitly update context state to trigger immediate UI update
        if (setActiveChildId) setActiveChildId(childId);

        // Store the selected child in localStorage for consistency
        const userKey = phoneNumber || (auth.currentUser ? getUserDatabaseKey(auth.currentUser) : null);
        if (userKey && typeof window !== "undefined") {
            window.localStorage.setItem(`activeChild_${userKey}`, childId);
        }

        // Initialize Quiz Session with correct structure (Flattened Child Object)
        if (typeof window !== "undefined") {
            const sessionUserDetails = {
                ...childProfile,
                phoneNumber: finalUserData.userKey,
                childId: childId,
                activeChildId: childId,
            };

            window.localStorage.setItem("quizSession", JSON.stringify({
                userDetails: sessionUserDetails,
                questionPaper: [],
                activeQuestionIndex: 0,
                remainingTime: 1800
            }));
        }

        // Show loading screen for a smooth transition
        setTimeout(() => {
            toast.success(`Welcome ${childProfile.name}!`);
            onSuccess && onSuccess(finalUserData);

            // Special Case: Deferred Redirect (e.g. show Grade Selector after)
            if (redirectPath === "NONE") {
                onClose();
                setProfileSelecting(false);
                return;
            }

            // Priority Redirect: If a specific path was requested (e.g. from Practice button)
            if (redirectPath) {
                if (redirectPath === "/practice" && childProfile.grade) {
                    const gradeDigit = childProfile.grade.replace(/\D/g, '');
                    router.push(`/practice?grade=${gradeDigit}`);
                } else {
                    router.push(redirectPath);
                }
            }
            // Default Redirect: Only auto-start quiz if grade is present
            else if (childProfile.grade && childProfile.grade !== "Select Grade" && childProfile.grade !== "" && childProfile.grade !== "N/A") {
                router.push("/quiz");
            } else {
                router.push("/dashboard");
            }
            onClose();
            setProfileSelecting(false);
        }, 1500);
    };
    const [step, setStep] = useState("CHOOSE_METHOD"); // CHOOSE_METHOD, PHONE, OTP, EMAIL_LOGIN, EMAIL_REGISTER, FORGOT_PASSWORD, REGISTER, SELECT_PROFILE
    const [loading, setLoading] = useState(false);
    const [profileSelecting, setProfileSelecting] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [confirmationResult, setConfirmationResult] = useState(null);
    const { setUserData, setActiveChildId } = useAuth();
    const router = useRouter();


    const [userProfiles, setUserProfiles] = useState(null); // To store existing profiles (children)
    // New state to track if we are updating an existing profile
    const [pendingProfileUpdate, setPendingProfileUpdate] = useState(null);

    const [registrationData, setRegistrationData] = useState({
        name: "",
        grade: ""
    });


    useEffect(() => {
        if (!open) {
            // Reset state when modal closes
            setStep("CHOOSE_METHOD");
            setPhoneNumber("");
            setOtp("");
            setLoading(false);
            setUserProfiles(null);
            setEmail("");
            setPassword("");
            setPendingProfileUpdate(null);
        }
    }, [open]);

    // ==================== GOOGLE SIGN-IN ====================
    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            try {
                // 1. Sync User to Postgres
                await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        uid: user.uid,
                        email: user.email,
                        role: 'parent', // Default
                        phone_number: user.phoneNumber
                    })
                });

                // 2. Fetch User Data
                const userRes = await fetch(`/api/users?uid=${user.uid}`);
                const userDataApi = await userRes.json();
                const dbUser = userDataApi.users?.[0];

                if (dbUser) {
                    // Check Teacher
                    if (dbUser.role === 'teacher') {
                        const normalizedTeacherData = {
                            ...dbUser,
                            isTeacher: true,
                            userType: 'teacher'
                        };
                        setUserData(normalizedTeacherData);
                        toast.success(`Welcome back!`);
                        onClose();
                        router.push("/teacher-dashboard");
                        setLoading(false);
                        return;
                    }

                    // Parent/Student - Fetch Children
                    let children = {};
                    try {
                        const childRes = await fetch(`/api/users/${user.uid}/children`);
                        const childData = await childRes.json();
                        children = childData.children || {};
                    } catch (e) {
                        console.error("Error fetching children", e);
                    }

                    const normalizedData = {
                        uid: dbUser.uid,
                        email: dbUser.email,
                        authProvider: "google",
                        children: children
                    };

                    if (Object.keys(children).length > 0) {
                        const childrenKeys = Object.keys(children);
                        if (childrenKeys.length === 1) {
                            const singleKey = childrenKeys[0];
                            const singleProfile = children[singleKey];
                            handleSelectProfile(singleKey, singleProfile);
                            return;
                        }

                        setUserProfiles(children);
                        setStep("SELECT_PROFILE");
                        toast.success("Welcome back! Select a profile.");
                    } else {
                        // No children -> Register
                        console.log("Existing user but no children found. Redirecting to Register.");
                        setRegistrationData({
                            ...registrationData,
                            email: user.email,
                            name: ""
                        });
                        setStep("REGISTER");
                    }
                } else {
                    // Should actally be handled by Sync, but fallback
                    setRegistrationData({
                        ...registrationData,
                        email: user.email,
                        name: ""
                    });
                    setStep("REGISTER");
                }

            } catch (err) {
                console.error("API Error during login:", err);
                // Fallback to register if something fails critically?
                // Or toast error.
                toast.error("Login verification failed.");
            }

        } catch (error) {
            console.error(error);
            if (error.code === 'auth/popup-closed-by-user') {
                toast.info("Sign-in cancelled");
            } else {
                toast.error("Google sign-in failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // ==================== EMAIL SIGN-IN ====================
    const handleEmailSignIn = async () => {
        if (!email || !password) {
            toast.error("Please enter both User ID and password");
            return;
        }

        setLoading(true);
        try {
            const { signInWithEmailAndPassword } = await import("firebase/auth");

            // Allow login with "S1001" by checking for @
            let authEmail = email;
            if (!email.includes('@')) {
                authEmail = `${email}@lgs.com`;
            }

            const result = await signInWithEmailAndPassword(auth, authEmail, password);
            const user = result.user;

            try {
                // 1. Sync User to Postgres
                await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        uid: user.uid,
                        email: user.email,
                        role: 'parent', // Default
                        phone_number: user.phoneNumber
                    })
                });

                // 2. Fetch User Data
                const userRes = await fetch(`/api/users?uid=${user.uid}`);
                const userDataApi = await userRes.json();
                const dbUser = userDataApi.users?.[0];

                if (dbUser) {
                    // Check Teacher
                    if (dbUser.role === 'teacher') {
                        const normalizedTeacherData = {
                            ...dbUser,
                            isTeacher: true,
                            userType: 'teacher'
                        };
                        setUserData(normalizedTeacherData);
                        toast.success(`Welcome back!`);
                        onClose();
                        router.push("/teacher-dashboard");
                        setLoading(false);
                        return;
                    }

                    // Parent/Student - Fetch Children
                    let children = {};
                    try {
                        const childRes = await fetch(`/api/users/${user.uid}/children`);
                        const childData = await childRes.json();
                        children = childData.children || {};
                    } catch (e) {
                        console.error("Error fetching children", e);
                    }

                    const normalizedData = {
                        uid: dbUser.uid,
                        email: dbUser.email,
                        authProvider: "email",
                        children: children
                    };

                    if (Object.keys(children).length > 0) {
                        const childrenKeys = Object.keys(children);
                        if (childrenKeys.length === 1) {
                            const singleKey = childrenKeys[0];
                            const singleProfile = children[singleKey];
                            handleSelectProfile(singleKey, singleProfile);
                            return;
                        }

                        setUserProfiles(children);
                        setStep("SELECT_PROFILE");
                        toast.success("Welcome back! Select a profile.");
                    } else {
                        // No children -> Register
                        // console.log("Existing user but no children found. Redirecting to Register.");
                        setRegistrationData({
                            ...registrationData,
                            email: user.email,
                            name: ""
                        });
                        setStep("REGISTER");
                    }
                } else {
                    // Should actally be handled by Sync, but fallback
                    setRegistrationData({
                        ...registrationData,
                        email: user.email,
                        name: ""
                    });
                    setStep("REGISTER");
                }

            } catch (err) {
                console.error("API Error during login:", err);
                toast.error("Login verification failed.");
            }

        } catch (error) {
            console.error(error);
            toast.error("Login failed. Check your User ID and password.");
        } finally {
            setLoading(false);
        }
    };


    const handleRegisterStart = async () => {
        if (!registrationData.grade) {
            toast.error("Please select a grade to continue");
            return;
        }

        setLoading(true);
        try {
            // Determine User Key
            const currentUser = auth.currentUser;
            if (!currentUser && !phoneNumber) {
                // Should not happen if flow is correct, but safety check
                toast.error("Authentication check failed. Please try signing in again.");
                setStep("CHOOSE_METHOD");
                return;
            }

            const userKey = phoneNumber || currentUser.uid;

            // Ensure Parent Exists (Sync again to be safe)
            if (currentUser) {
                await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        uid: currentUser.uid,
                        email: currentUser.email,
                        role: 'parent',
                        phone_number: phoneNumber || currentUser.phoneNumber
                    })
                });
            }

            // Check if we are updating an existing profile
            if (pendingProfileUpdate) {
                const { childId, childProfile } = pendingProfileUpdate;

                const updatedChildData = {
                    childId: childId,
                    grade: registrationData.grade,
                    name: registrationData.name || childProfile.name || "Student 1"
                };

                const res = await fetch(`/api/users/${userKey}/children`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedChildData)
                });

                if (!res.ok) throw new Error("Failed to update profile");
                const data = await res.json();

                toast.success("Profile updated successfully!");
                handleSelectProfile(childId, data.child || updatedChildData);
                setPendingProfileUpdate(null); // Clear pending state
                return;
            }

            // --- CREATE NEW PROFILE FLOW ---
            const childName = registrationData.name || "Student 1";

            const newChildData = {
                name: childName,
                grade: registrationData.grade,
                // childId generated by backend or we can support sending one? Backend handles it.
            };

            const res = await fetch(`/api/users/${userKey}/children`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newChildData)
            });

            if (!res.ok) throw new Error("Failed to create profile");
            const data = await res.json();
            const createdChild = data.child;

            // Shim for handleSelectProfile which expects normalized child object
            const finalChild = {
                ...createdChild,
                name: createdChild.name,
                grade: createdChild.grade
            };

            // Proceed to Start Assessment
            toast.success("Registration Successful!");
            handleSelectProfile(createdChild.child_id, finalChild);

        } catch (error) {
            console.error("Registration Error:", error);
            toast.error("Failed to start assessment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Loading Screen when selecting profile */}
            {profileSelecting && (
                <LoadingScreen
                    title="Preparing Your Assessment"
                    subtitle="Setting up your personalized math challenge..."
                />
            )}

            <Dialog
                open={open && !profileSelecting}
                onClose={onClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    className: Styles.modalPaper
                }}
            >
                <DialogTitle className={Styles.modalHeader}>
                    <div className={Styles.headerContent}>
                        {step === "CHOOSE_METHOD" && "Sign In"}
                        {step === "SELECT_PROFILE" && "Select Profile"}
                        {step === "REGISTER" && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <GraduationCap size={28} className={Styles.headerIcon} />
                                <span>Select Your Grade</span>
                            </div>
                        )}
                    </div>
                    <IconButton onClick={onClose} className={Styles.closeButton}>
                        <X size={20} />
                    </IconButton>
                </DialogTitle>

                <DialogContent className={`${Styles.modalContent} ${step === "SELECT_PROFILE" ? Styles.fixedModalContent : ""}`}>
                    <div id="recaptcha-container"></div>

                    {/* ==================== CHOOSE METHOD ==================== */}
                    {step === "CHOOSE_METHOD" && (
                        <div className={Styles.stepContainer}>
                            {/* <p className={Styles.stepDescription}>Click here to sign in</p> */}

                            {/* Email/Password Login */}
                            <div className={Styles.emailLoginContainer}>
                                <TextField
                                    label="User ID"
                                    placeholder="e.g. S1001"
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    size="medium"
                                    fullWidth
                                    margin="dense"
                                    className={Styles.textField}
                                />
                                <TextField
                                    label="Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    size="medium"
                                    fullWidth
                                    margin="dense"
                                    className={Styles.textField}
                                />
                                <Button
                                    onClick={handleEmailSignIn}
                                    className={Styles.actionButton}
                                    fullWidth
                                    disabled={loading}
                                >
                                    Sign In
                                </Button>
                            </div>

                            {/* OR Divider */}
                            <div className={Styles.divider}>
                                <span>OR</span>
                            </div>

                            <Button
                                onClick={handleGoogleSignIn}
                                className={Styles.googleButton}
                                startIcon={
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M23.52 12.29C23.52 11.43 23.44 10.61 23.29 9.81H12V14.41H18.45C18.17 15.89 17.33 17.15 16.06 18H16.07L19.92 20.98C22.18 18.9 23.52 15.82 23.52 12.29Z" fill="#4285F4" />
                                        <path d="M12 24C15.24 24 17.96 22.92 19.93 21.01L16.08 18.03C15 18.75 13.62 19.19 12 19.19C8.87 19.19 6.22 17.07 5.27 14.22H1.28V17.31C3.25 21.23 7.31 24 12 24Z" fill="#34A853" />
                                        <path d="M5.27 14.22C5.03 13.5 4.9 12.75 4.9 12C4.9 11.25 5.03 10.5 5.27 9.77V6.69H1.28C0.46 8.31 0 10.11 0 12C0 13.89 0.46 15.68 1.28 17.31L5.27 14.22Z" fill="#FBBC05" />
                                        <path d="M12 4.81C13.76 4.81 15.34 5.42 16.59 6.61L20.01 3.2C17.95 1.28 15.23 0 12 0C7.31 0 3.25 2.77 1.28 6.69L5.27 9.77C6.22 6.93 8.87 4.81 12 4.81Z" fill="#EA4335" />
                                    </svg>
                                }
                                disabled={loading}
                            >
                                Sign in with Google
                            </Button>


                        </div>
                    )}

                    {/* ==================== PHONE STEP ==================== */}
                    {step === "PHONE" && (
                        <div className={Styles.stepContainer}>
                            <p className={Styles.stepDescription}>Enter your mobile number to get started</p>
                            <div className={Styles.inputGroup}>
                                <Phone className={Styles.inputIcon} size={20} />
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    variant="outlined"
                                    type="tel"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    InputProps={{
                                        startAdornment: <span className={Styles.prefix}>+91</span>,
                                    }}
                                    className={Styles.textField}
                                />
                            </div>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleSendOtp}
                                disabled={loading || phoneNumber.length !== 10}
                                className={Styles.actionButton}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Send OTP"}
                            </Button>
                            <Button
                                onClick={() => setStep("CHOOSE_METHOD")}
                                className={Styles.backButton}
                                disabled={loading}
                            >
                                Back to Sign In Options
                            </Button>
                        </div>
                    )}

                    {/* ==================== OTP STEP ==================== */}
                    {step === "OTP" && (
                        <div className={Styles.stepContainer}>
                            <p className={Styles.stepDescription}>Enter the 6-digit code sent to +91 {phoneNumber}</p>
                            <TextField
                                fullWidth
                                label="OTP"
                                variant="outlined"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className={Styles.textField}
                                autoFocus
                            />
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleVerifyOtp}
                                disabled={loading || otp.length !== 6}
                                className={Styles.actionButton}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Verify & Continue"}
                            </Button>
                            <Button
                                onClick={() => setStep("PHONE")}
                                className={Styles.backButton}
                                disabled={loading}
                            >
                                Change Phone Number
                            </Button>
                        </div>
                    )}

                    {/* ==================== SELECT PROFILE STEP ==================== */}
                    {step === "SELECT_PROFILE" && userProfiles && (
                        <div className={Styles.stepContainer}>
                            <p className={Styles.stepDescription}>Select who is taking the test</p>

                            <div className={Styles.profileList}>
                                {/* Add New Student Item */}
                                <div
                                    className={`${Styles.profileListItem} ${Styles.addProfileItem}`}
                                    onClick={() => setStep("REGISTER")}
                                >
                                    <div className={Styles.profileListAvatar}>
                                        <Plus size={18} />
                                    </div>
                                    <div className={Styles.profileListInfo}>
                                        <div className={Styles.profileListName}>Add Student</div>
                                    </div>
                                </div>

                                {Object.entries(userProfiles).map(([key, profile]) => (
                                    <div
                                        key={key}
                                        className={Styles.profileListItem}
                                        onClick={() => handleSelectProfile(key, profile)}
                                    >
                                        <div className={Styles.profileListAvatar}>
                                            {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
                                        </div>
                                        <div className={Styles.profileListInfo}>
                                            <div className={Styles.profileListName}>{profile.name}</div>
                                            <div className={Styles.profileListGrade}>{profile.grade}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={() => setStep("CHOOSE_METHOD")}
                                className={Styles.backButton}
                                disabled={loading}
                            >
                                Sign in with different account
                            </Button>
                        </div>
                    )}



                    {/* ==================== REGISTER (Complete Profile) ==================== */}
                    {step === "REGISTER" && (
                        <div className={Styles.stepContainer}>
                            {/* <div className={Styles.welcomeText}>
                                Welcome! Let's get started with your math assessment.
                            </div> */}

                            <form className={Styles.formGrid}>
                                <div className={Styles.inputGroup}>
                                    <User className={Styles.inputIcon} size={20} />
                                    <TextField
                                        fullWidth
                                        placeholder="Enter student name"
                                        variant="outlined"
                                        value={registrationData.name}
                                        onChange={(e) => setRegistrationData({ ...registrationData, name: e.target.value })}
                                        className={Styles.textField}
                                        autoFocus
                                    />
                                </div>

                                <div className={Styles.gradeSection}>
                                    {/* <label className={Styles.gradeLabel}>Which grade are you in?</label> */}
                                    <FormControl fullWidth variant="outlined" className={Styles.gradeSelect}>
                                        <Select
                                            value={registrationData.grade}
                                            displayEmpty
                                            onChange={(e) => setRegistrationData({ ...registrationData, grade: e.target.value })}
                                            renderValue={(selected) => {
                                                if (!selected) {
                                                    return <span style={{ color: '#9ca3af' }}>Grade</span>;
                                                }
                                                return selected;
                                            }}
                                        >
                                            <MenuItem disabled value="">
                                                <em>Grade</em>
                                            </MenuItem>
                                            {[...Array(12)].map((_, i) => (
                                                <MenuItem key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>
                            </form>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleRegisterStart}
                                disabled={loading}
                                className={Styles.actionButton}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Start Assessment →"}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AuthModal;
