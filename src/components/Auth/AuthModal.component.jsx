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

const AuthModal = ({ open, onClose, onSuccess }) => {

    // Helper to handle final profile selection
    const handleSelectProfile = (childId, childProfile) => {
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

        // Store the selected child in localStorage for consistency
        const userKey = phoneNumber || (auth.currentUser ? getUserDatabaseKey(auth.currentUser) : null);
        if (userKey && typeof window !== "undefined") {
            window.localStorage.setItem(`activeChild_${userKey}`, childId);
        }

        // Initialize Quiz Session
        if (typeof window !== "undefined") {
            window.localStorage.setItem("quizSession", JSON.stringify({
                userDetails: finalUserData,
                questionPaper: [],
                activeQuestionIndex: 0,
                remainingTime: 1800
            }));
        }

        // Show loading screen for a smooth transition
        setTimeout(() => {
            toast.success(`Welcome ${childProfile.name}!`);
            onSuccess && onSuccess(finalUserData);
            router.push("/quiz");
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
    const { setUserData } = useAuth();
    const router = useRouter();


    const [userProfiles, setUserProfiles] = useState(null); // To store existing profiles (children)

    const [registrationData, setRegistrationData] = useState({
        name: "",
        grade: "",
        role: "",
        schoolName: "",
        phone: "",
        extraRoles: {}
    });



    useEffect(() => {
        if (!open) {
            // Reset state when modal closes
            setStep("CHOOSE_METHOD");
            setPhoneNumber("");
            setOtp("");
            setLoading(false);
            setUserProfiles(null);
        }
    }, [open]);

    // ==================== GOOGLE SIGN-IN ====================
    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if user profile exists
            const userKey = getUserDatabaseKey(user);
            const userRef = ref(firebaseDatabase, `NMD_2025/Registrations/${userKey}`);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                // Existing user - login success
                const rawData = snapshot.val();
                let normalizedData;
                if (rawData && rawData.children) {
                    normalizedData = rawData;
                } else {
                    normalizedData = {
                        authProvider: "google",
                        parentEmail: user.email,
                        parentEmail: user.email,
                        children: { default: rawData }
                    };
                }

                // If there are multiple children (or even one), we might want to let them select
                // But for now, if it's existing Google login, we might follow same pattern as verifyOtp
                // Let's adapt it to show selection if children exist
                if (normalizedData.children && Object.keys(normalizedData.children).length > 0) {
                    setUserProfiles(normalizedData.children);
                    setStep("SELECT_PROFILE");
                    toast.success("Welcome back! Select a profile.");
                } else {
                    // Fallback for old data or immediate login
                    setUserData(normalizedData);
                    toast.success("Logged in successfully!");
                    onSuccess && onSuccess(normalizedData);
                    onClose();
                }
            } else {
                // New user - go to registration (only email, name will be collected on quiz submit)
                setRegistrationData({
                    ...registrationData,
                    email: user.email,
                    name: "" // Name will be collected on first quiz submit
                });
                setStep("REGISTER");
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



    // ==================== GOOGLE REGISTRATION (Complete Profile) ====================
    const handleGoogleRegister = async () => {
        const { grade, role, schoolName, phone, name, extraRoles } = registrationData;

        if (!name) {
            toast.error("Please enter your name");
            return;
        }

        if (!schoolName) {
            toast.error("Please enter your school name");
            return;
        }

        if (!role) {
            toast.error("Please select a role");
            return;
        }

        if (role === 'Student' && !grade) {
            toast.error("Please select a grade");
            return;
        }

        if (!phone || phone.length !== 10) {
            toast.error("Please enter a valid 10-digit phone number");
            return;
        }

        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) {
                toast.error("Authentication error. Please try again.");
                return;
            }

            const childId = `student_${Date.now()}`;
            // Construct the selected sub-roles list
            const selectedExtraRoles = extraRoles ? Object.keys(extraRoles).filter(k => extraRoles[k]) : [];

            // Main User Profile Data
            const userProfileData = {
                name: name,
                email: user.email,
                phone: phone, // Save phone at top level
                schoolName: schoolName,
                role: role,
                extraRoles: selectedExtraRoles,
                createdAt: new Date().toISOString(),
                authProvider: "google",
                parentEmail: user.email,
            };

            const childProfile = {
                name: name,
                email: user.email,
                grade: role === 'Student' ? grade : 'N/A', // Only relevant if student
                schoolName: schoolName,
                role: role,
                createdAt: new Date().toISOString()
            };


            // If it's a student, we add them as a 'child' under the main user to keep existing flow
            // If it's another role, we still might need this structure for the app to function (quiz/dashboard)
            // For now, we'll create a child profile for everyone so they can 'take the test' or enter dashboard.

            const userDataUpdate = {
                [`NMD_2025/Registrations/${getUserDatabaseKey(user)}`]: {
                    ...userProfileData,
                    children: {
                        [childId]: childProfile
                    }
                }
            };

            await update(ref(firebaseDatabase), userDataUpdate);

            // Construct full user object for checking context
            // We need to fetch fresh data or construct it carefully
            const snapshot = await get(ref(firebaseDatabase, `NMD_2025/Registrations/${getUserDatabaseKey(user)}`));
            const fullData = snapshot.val();

            // If we just registered, auto-select this new profile
            const normalizedData = {
                authProvider: "google",
                parentEmail: user.email,
                children: fullData.children || { [childId]: childProfile }
            };

            // Select the newly created child
            const selectedChildData = {
                ...normalizedData,
                activeChildId: childId,
                activeChild: childProfile,
                userKey: getUserDatabaseKey(user) // Explicitly store the correct DB key (UID for google)
            };

            setUserData(selectedChildData);
            toast.success("Profile created successfully!");

            // Store the newly created child as active in localStorage
            const userKey = getUserDatabaseKey(user);
            if (typeof window !== "undefined" && userKey) {
                window.localStorage.setItem(`activeChild_${userKey}`, childId);

                // Initialize Quiz Session
                window.localStorage.setItem("quizSession", JSON.stringify({
                    userDetails: selectedChildData,
                    questionPaper: [],
                    activeQuestionIndex: 0,
                    remainingTime: 1800
                }));
            }

            onSuccess && onSuccess(selectedChildData);
            router.push("/quiz");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to create profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };



    // ==================== PHONE AUTH (Existing) ====================
    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': (response) => {
                    // reCAPTCHA solved
                }
            });
        }
    };

    const handleSendOtp = async () => {
        if (phoneNumber.length !== 10) {
            toast.error("Please enter a valid 10-digit phone number");
            return;
        }

        setLoading(true);

        try {
            // CHECK IF USER EXISTS FIRST
            const userRef = ref(firebaseDatabase, `NMD_2025/Registrations/${phoneNumber}`);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                // DIRECT LOGIN / PROFILE SELECTION
                const rawData = snapshot.val();
                let normalizedData;

                // Normalize data structure (handle legacy vs new)
                if (rawData && rawData.children) {
                    normalizedData = rawData;
                } else if (rawData) {
                    normalizedData = {
                        parentPhone: phoneNumber,
                        authProvider: "phone",
                        children: {
                            default: rawData
                        }
                    };
                } else {
                    // Should not match snapshot.exists() but safety check
                    normalizedData = null;
                }

                if (normalizedData && normalizedData.children && Object.keys(normalizedData.children).length > 0) {
                    setUserProfiles(normalizedData.children);
                    setStep("SELECT_PROFILE");
                    toast.success("Welcome back!");
                } else {
                    // Direct Login if no children found (unlikely for valid user)
                    setUserData(normalizedData);
                    toast.success("Logged in successfully!");
                    onSuccess && onSuccess(normalizedData);
                    onClose();
                }
                setLoading(false);
                return; // RETURN EARLY - DO NOT SEND OTP
            }

            // --- USER DOES NOT EXIST -> PROCEED WITH OTP ---
            setupRecaptcha();
            const appVerifier = window.recaptchaVerifier;
            const formatPh = "+91" + phoneNumber;

            const confirmation = await signInWithPhoneNumber(auth, formatPh, appVerifier);
            setConfirmationResult(confirmation);
            setStep("OTP");
            toast.success("OTP sent successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to process request. Please try again.");
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }

        setLoading(true);
        try {
            const result = await confirmationResult.confirm(otp);
            const user = result.user;

            // Check if user profile exists
            const userRef = ref(firebaseDatabase, `NMD_2025/Registrations/${phoneNumber}`);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                // User exists, login success
                const rawData = snapshot.val();
                let normalizedData;
                if (rawData && rawData.children) {
                    normalizedData = rawData;
                } else if (rawData) {
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

                if (normalizedData && normalizedData.children && Object.keys(normalizedData.children).length > 0) {
                    setUserProfiles(normalizedData.children);
                    setStep("SELECT_PROFILE");
                    toast.success("Verified! Select a profile.");
                } else {
                    setUserData(normalizedData);
                    toast.success("Logged in successfully!");
                    onSuccess && onSuccess(normalizedData);
                    onClose();
                }
            } else {
                // User does not exist, move to registration
                setStep("REGISTER");
            }
        } catch (error) {
            console.error(error);
            toast.error("Invalid OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneRegister = async () => {
        const { grade } = registrationData;
        if (!grade) {
            toast.error("Please select a grade");
            return;
        }

        setLoading(true);
        try {
            // Generate unique child ID
            const childId = `student_${Date.now()}`;
            const childProfile = {
                name: "", // Name will be collected on first quiz submit
                grade,
                phoneNumber: phoneNumber,
                createdAt: new Date().toISOString()
            };

            const userDataUpdate = {
                [`NMD_2025/Registrations/${phoneNumber}/children/${childId}`]: childProfile,
                [`NMD_2025/Registrations/${phoneNumber}/parentPhone`]: phoneNumber,
                [`NMD_2025/Registrations/${phoneNumber}/authProvider`]: "phone",
            };

            await update(ref(firebaseDatabase), userDataUpdate);

            // Fetch updated data to ensure consistency
            const snapshot = await get(ref(firebaseDatabase, `NMD_2025/Registrations/${phoneNumber}`));
            const fullData = snapshot.val();

            const normalizedData = {
                parentPhone: phoneNumber,
                authProvider: "phone",
                children: fullData.children || { [childId]: childProfile }
            };

            // Select the newly created child
            const selectedChildData = {
                ...normalizedData,
                activeChildId: childId,
                activeChild: childProfile,
                userKey: phoneNumber // Explicitly store
            };


            setUserData(selectedChildData);
            toast.success("Profile created successfully!");

            // Store the newly created child as active in localStorage
            if (typeof window !== "undefined") {
                window.localStorage.setItem(`activeChild_${phoneNumber}`, childId);

                // Initialize Quiz Session
                window.localStorage.setItem("quizSession", JSON.stringify({
                    userDetails: selectedChildData,
                    questionPaper: [],
                    activeQuestionIndex: 0,
                    remainingTime: 1800
                }));
            }

            onSuccess && onSuccess(selectedChildData);
            router.push("/quiz");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to create profile. Please try again.");
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
                        {step === "CHOOSE_METHOD" && "Sign In / Register"}
                        {/* {step === "PHONE" && "Phone Authentication"} */}
                        {/* {step === "OTP" && "Verify OTP"} */}
                        {step === "SELECT_PROFILE" && "Select Profile"}
                        {step === "REGISTER" && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {/* <GraduationCap size={28} className={Styles.headerIcon} /> */}
                                <span>Complete Registration</span>
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
                            <p className={Styles.stepDescription}>Click here to sign in or register</p>

                            {/* Google Sign-In */}
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className={Styles.googleButton}
                                startIcon={
                                    <svg width="18" height="18" viewBox="0 0 18 18">
                                        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                                        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                                        <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z" />
                                        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
                                    </svg>
                                }
                            >
                                Sign in with Google
                            </Button>

                            {/* Phone Sign-In */}
                            {/* <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => setStep("PHONE")}
                            disabled={loading}
                            className={Styles.phoneButton}
                            startIcon={<Phone size={18} />}
                            sx={{ mt: 2 }}
                        >
                            Continue with Phone
                        </Button> */}


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
                            {/* <h3 style={{ textAlign: "center", marginBottom: "16px" }}>Complete Registration</h3> */}

                            <form className={Styles.formGrid} style={{ gap: '16px', display: 'flex', flexDirection: 'column' }}>

                                {/* Name Field */}
                                <TextField
                                    fullWidth
                                    label="Name"
                                    variant="outlined"
                                    required
                                    value={registrationData.name}
                                    onChange={(e) => setRegistrationData({ ...registrationData, name: e.target.value })}
                                />

                                {/* Phone Field (If not already provided via phone auth) */}
                                {auth.currentUser?.providerData[0]?.providerId === 'google.com' && (
                                    <TextField
                                        fullWidth
                                        label="Phone Number"
                                        variant="outlined"
                                        type="tel"
                                        required
                                        inputProps={{ maxLength: 10 }}
                                        value={registrationData.phone || ""}
                                        onChange={(e) => setRegistrationData({ ...registrationData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">+91</InputAdornment>,
                                        }}
                                    />
                                )}

                                {/* School Name */}
                                <TextField
                                    fullWidth
                                    label="School Name"
                                    variant="outlined"
                                    required
                                    value={registrationData.schoolName || ""}
                                    onChange={(e) => setRegistrationData({ ...registrationData, schoolName: e.target.value })}
                                />

                                {/* Role Selection */}
                                <FormControl component="fieldset">
                                    <span className={Styles.label}>I am a:</span>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                                        {['Student', 'Parent', 'Teacher', 'Other'].map((role) => (
                                            <div
                                                key={role}
                                                onClick={() => setRegistrationData({ ...registrationData, role: role, extraRoles: {} })}
                                                style={{
                                                    padding: '8px 16px',
                                                    borderRadius: '20px',
                                                    border: registrationData.role === role ? '2px solid #2563eb' : '1px solid #e0e0e0',
                                                    backgroundColor: registrationData.role === role ? '#eff6ff' : 'transparent',
                                                    color: registrationData.role === role ? '#2563eb' : 'inherit',
                                                    cursor: 'pointer',
                                                    fontWeight: registrationData.role === role ? 600 : 400,
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {role}
                                            </div>
                                        ))}
                                    </div>
                                </FormControl>


                                {/* Conditional Fields based on Role */}

                                {/* STUDENT: Grade Selection */}
                                {registrationData.role === 'Student' && (
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel>Grade</InputLabel>
                                        <Select
                                            value={registrationData.grade || ""}
                                            onChange={(e) => setRegistrationData({ ...registrationData, grade: e.target.value })}
                                            label="Grade"
                                        >
                                            {[...Array(10)].map((_, i) => (
                                                <MenuItem key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}

                                {/* PARENT or OTHER: Checkboxes */}
                                {(registrationData.role === 'Parent' || registrationData.role === 'Other') && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <span className={Styles.label}>Interested in contributing as:</span>
                                        {['Math Connector', 'Math Companion', 'Math Mentor'].map((subRole) => (
                                            <label key={subRole} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={!!registrationData.extraRoles?.[subRole]}
                                                    onChange={(e) => {
                                                        const newExtraRoles = { ...registrationData.extraRoles, [subRole]: e.target.checked };
                                                        setRegistrationData({ ...registrationData, extraRoles: newExtraRoles });
                                                    }}
                                                    style={{ width: '18px', height: '18px' }}
                                                />
                                                {subRole}
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {/* TEACHER: Checkboxes */}
                                {registrationData.role === 'Teacher' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <span className={Styles.label}>Teaching Role:</span>
                                        {['Class Teacher', 'Math Teacher'].map((subRole) => (
                                            <label key={subRole} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={!!registrationData.extraRoles?.[subRole]}
                                                    onChange={(e) => {
                                                        const newExtraRoles = { ...registrationData.extraRoles, [subRole]: e.target.checked };
                                                        setRegistrationData({ ...registrationData, extraRoles: newExtraRoles });
                                                    }}
                                                    style={{ width: '18px', height: '18px' }}
                                                />
                                                {subRole}
                                            </label>
                                        ))}
                                    </div>
                                )}

                            </form>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={auth.currentUser?.providerData[0]?.providerId === 'google.com' ? handleGoogleRegister : handlePhoneRegister}
                                disabled={loading}
                                className={Styles.actionButton}
                                sx={{ marginTop: '20px' }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Complete Registration →"}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AuthModal;
