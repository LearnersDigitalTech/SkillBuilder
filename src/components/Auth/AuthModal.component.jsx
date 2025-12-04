"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, IconButton, CircularProgress, TextField, Button, Select, MenuItem, InputLabel, FormControl, Divider, InputAdornment } from "@mui/material";
import { X, Phone, User, Mail, School, MapPin, GraduationCap, Eye, EyeOff } from "lucide-react";
import { RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, firebaseDatabase, googleProvider, getUserDatabaseKey } from "@/backend/firebaseHandler";
import { ref, set, get } from "firebase/database";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import Styles from "./AuthModal.module.css";

const AuthModal = ({ open, onClose, onSuccess }) => {
    const [step, setStep] = useState("CHOOSE_METHOD"); // CHOOSE_METHOD, PHONE, OTP, EMAIL_LOGIN, EMAIL_REGISTER, FORGOT_PASSWORD, REGISTER
    const [loading, setLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [confirmationResult, setConfirmationResult] = useState(null);
    const { setUserData } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const [emailLoginForm, setEmailLoginForm] = useState({
        email: "",
        password: ""
    });

    const [registrationData, setRegistrationData] = useState({
        name: "",
        email: "",
        password: "",
        schoolName: "",
        city: "",
        grade: ""
    });

    const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

    useEffect(() => {
        if (!open) {
            // Reset state when modal closes
            setStep("CHOOSE_METHOD");
            setPhoneNumber("");
            setOtp("");
            setLoading(false);
            setShowPassword(false);
            setEmailLoginForm({ email: "", password: "" });
            setRegistrationData({
                name: "",
                email: "",
                password: "",
                schoolName: "",
                city: "",
                grade: ""
            });
            setForgotPasswordEmail("");
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
                        children: { default: rawData }
                    };
                }
                setUserData(normalizedData);
                toast.success("Logged in successfully!");
                onSuccess && onSuccess(normalizedData);
                onClose();
            } else {
                // New user - go to registration
                setRegistrationData({
                    ...registrationData,
                    email: user.email,
                    name: user.displayName || ""
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

    // ==================== EMAIL/PASSWORD LOGIN ====================
    const handleEmailLogin = async () => {
        const { email, password } = emailLoginForm;

        if (!email || !password) {
            toast.error("Please enter email and password");
            return;
        }

        setLoading(true);
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            const user = result.user;

            // Fetch user data
            const userKey = getUserDatabaseKey(user);
            const userRef = ref(firebaseDatabase, `NMD_2025/Registrations/${userKey}`);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                const rawData = snapshot.val();
                let normalizedData;
                if (rawData && rawData.children) {
                    normalizedData = rawData;
                } else {
                    normalizedData = {
                        authProvider: "email",
                        parentEmail: user.email,
                        children: { default: rawData }
                    };
                }
                setUserData(normalizedData);
                toast.success("Logged in successfully!");
                onSuccess && onSuccess(normalizedData);
                onClose();
            } else {
                toast.error("Profile not found. Please register first.");
            }
        } catch (error) {
            console.error(error);
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                toast.error("Invalid email or password");
            } else if (error.code === 'auth/user-not-found') {
                toast.error("No account found with this email");
            } else {
                toast.error("Login failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // ==================== EMAIL/PASSWORD REGISTRATION ====================
    const handleEmailRegister = async () => {
        const { email, password, name, schoolName, city, grade } = registrationData;

        if (!email || !password || !name || !schoolName || !city || !grade) {
            toast.error("Please fill all fields");
            return;
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setLoading(true);
        try {
            // Create auth account
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const user = result.user;

            // Create profile in database
            const childId = "default";
            const childProfile = {
                name,
                email,
                schoolName,
                city,
                grade,
                createdAt: new Date().toISOString()
            };

            const userData = {
                authProvider: "email",
                parentEmail: user.email,
                children: {
                    [childId]: childProfile
                }
            };

            const userKey = getUserDatabaseKey(user);
            await set(ref(firebaseDatabase, `NMD_2025/Registrations/${userKey}`), userData);
            setUserData(userData);
            toast.success("Account created successfully!");
            onSuccess && onSuccess(userData);
            onClose();
        } catch (error) {
            console.error(error);
            if (error.code === 'auth/email-already-in-use') {
                toast.error("Email already registered. Please login.");
            } else if (error.code === 'auth/weak-password') {
                toast.error("Password is too weak. Use at least 8 characters.");
            } else {
                toast.error("Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // ==================== GOOGLE REGISTRATION (Complete Profile) ====================
    const handleGoogleRegister = async () => {
        const { name, schoolName, city, grade } = registrationData;

        if (!name || !schoolName || !city || !grade) {
            toast.error("Please fill all fields");
            return;
        }

        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) {
                toast.error("Authentication error. Please try again.");
                return;
            }

            const childId = "default";
            const childProfile = {
                name,
                email: user.email,
                schoolName,
                city,
                grade,
                createdAt: new Date().toISOString()
            };

            const userData = {
                authProvider: "google",
                parentEmail: user.email,
                children: {
                    [childId]: childProfile
                }
            };

            const userKey = getUserDatabaseKey(user);
            await set(ref(firebaseDatabase, `NMD_2025/Registrations/${userKey}`), userData);
            setUserData(userData);
            toast.success("Profile created successfully!");
            onSuccess && onSuccess(userData);
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to create profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ==================== FORGOT PASSWORD ====================
    const handleForgotPassword = async () => {
        if (!forgotPasswordEmail) {
            toast.error("Please enter your email");
            return;
        }

        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, forgotPasswordEmail);
            toast.success("Password reset email sent! Check your inbox.");
            setStep("EMAIL_LOGIN");
            setForgotPasswordEmail("");
        } catch (error) {
            console.error(error);
            if (error.code === 'auth/user-not-found') {
                toast.error("No account found with this email");
            } else {
                toast.error("Failed to send reset email");
            }
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
        setupRecaptcha();
        const appVerifier = window.recaptchaVerifier;
        const formatPh = "+91" + phoneNumber;

        try {
            const confirmation = await signInWithPhoneNumber(auth, formatPh, appVerifier);
            setConfirmationResult(confirmation);
            setStep("OTP");
            toast.success("OTP sent successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to send OTP. Please try again.");
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

                setUserData(normalizedData);
                toast.success("Logged in successfully!");
                onSuccess && onSuccess(normalizedData);
                onClose();
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
        const { name, email, schoolName, city, grade } = registrationData;
        if (!name || !schoolName || !city || !grade) {
            toast.error("Please fill all fields");
            return;
        }

        setLoading(true);
        try {
            const childId = "default";
            const childProfile = {
                ...registrationData,
                phoneNumber: phoneNumber,
                createdAt: new Date().toISOString()
            };

            const userData = {
                parentPhone: phoneNumber,
                authProvider: "phone",
                children: {
                    [childId]: childProfile
                }
            };

            await set(ref(firebaseDatabase, `NMD_2025/Registrations/${phoneNumber}`), userData);
            setUserData(userData);
            toast.success("Profile created successfully!");
            onSuccess && onSuccess(userData);
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to create profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
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
                    {step === "PHONE" && "Phone Authentication"}
                    {step === "OTP" && "Verify OTP"}
                    {step === "EMAIL_LOGIN" && "Email Login"}
                    {step === "EMAIL_REGISTER" && "Create Account"}
                    {step === "FORGOT_PASSWORD" && "Reset Password"}
                    {step === "REGISTER" && "Complete Profile"}
                </div>
                <IconButton onClick={onClose} className={Styles.closeButton}>
                    <X size={20} />
                </IconButton>
            </DialogTitle>

            <DialogContent className={Styles.modalContent}>
                <div id="recaptcha-container"></div>

                {/* ==================== CHOOSE METHOD ==================== */}
                {step === "CHOOSE_METHOD" && (
                    <div className={Styles.stepContainer}>
                        <p className={Styles.stepDescription}>Choose your preferred sign-in method</p>

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
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => setStep("PHONE")}
                            disabled={loading}
                            className={Styles.phoneButton}
                            startIcon={<Phone size={18} />}
                            sx={{ mt: 2 }}
                        >
                            Continue with Phone
                        </Button>

                        <Divider sx={{ my: 3 }}>OR</Divider>

                        {/* Email Login Form */}
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={emailLoginForm.email}
                            onChange={(e) => setEmailLoginForm({ ...emailLoginForm, email: e.target.value })}
                            className={Styles.textField}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            value={emailLoginForm.password}
                            onChange={(e) => setEmailLoginForm({ ...emailLoginForm, password: e.target.value })}
                            className={Styles.textField}
                            margin="normal"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleEmailLogin}
                            disabled={loading || !emailLoginForm.email || !emailLoginForm.password}
                            className={Styles.actionButton}
                            sx={{ mt: 2 }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
                        </Button>

                        <div className={Styles.linkContainer}>
                            <Button
                                onClick={() => setStep("FORGOT_PASSWORD")}
                                className={Styles.linkButton}
                                disabled={loading}
                            >
                                Forgot Password?
                            </Button>
                            <Button
                                onClick={() => setStep("EMAIL_REGISTER")}
                                className={Styles.linkButton}
                                disabled={loading}
                            >
                                Create Account
                            </Button>
                        </div>
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

                {/* ==================== EMAIL REGISTER ==================== */}
                {step === "EMAIL_REGISTER" && (
                    <div className={Styles.stepContainer}>
                        <p className={Styles.stepDescription}>Create your account</p>
                        <form className={Styles.formGrid}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                value={registrationData.name}
                                onChange={(e) => setRegistrationData({ ...registrationData, name: e.target.value })}
                                margin="dense"
                            />
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={registrationData.email}
                                onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })}
                                margin="dense"
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                value={registrationData.password}
                                onChange={(e) => setRegistrationData({ ...registrationData, password: e.target.value })}
                                margin="dense"
                                helperText="At least 8 characters"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                            <TextField
                                fullWidth
                                label="School Name"
                                value={registrationData.schoolName}
                                onChange={(e) => setRegistrationData({ ...registrationData, schoolName: e.target.value })}
                                margin="dense"
                            />
                            <TextField
                                fullWidth
                                label="City"
                                value={registrationData.city}
                                onChange={(e) => setRegistrationData({ ...registrationData, city: e.target.value })}
                                margin="dense"
                            />
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Grade</InputLabel>
                                <Select
                                    value={registrationData.grade}
                                    label="Grade"
                                    onChange={(e) => setRegistrationData({ ...registrationData, grade: e.target.value })}
                                >
                                    {[...Array(10)].map((_, i) => (
                                        <MenuItem key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </form>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleEmailRegister}
                            disabled={loading}
                            className={Styles.actionButton}
                            sx={{ mt: 2 }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Create Account"}
                        </Button>
                        <Button
                            onClick={() => setStep("CHOOSE_METHOD")}
                            className={Styles.backButton}
                            disabled={loading}
                        >
                            Back to Sign In
                        </Button>
                    </div>
                )}

                {/* ==================== FORGOT PASSWORD ==================== */}
                {step === "FORGOT_PASSWORD" && (
                    <div className={Styles.stepContainer}>
                        <p className={Styles.stepDescription}>Enter your email to reset your password</p>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            className={Styles.textField}
                            margin="normal"
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleForgotPassword}
                            disabled={loading || !forgotPasswordEmail}
                            className={Styles.actionButton}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Send Reset Link"}
                        </Button>
                        <Button
                            onClick={() => setStep("CHOOSE_METHOD")}
                            className={Styles.backButton}
                            disabled={loading}
                        >
                            Back to Sign In
                        </Button>
                    </div>
                )}

                {/* ==================== REGISTER (Complete Profile) ==================== */}
                {step === "REGISTER" && (
                    <div className={Styles.stepContainer}>
                        <p className={Styles.stepDescription}>Tell us a bit about yourself</p>
                        <form className={Styles.formGrid}>
                            <div className={Styles.inputGroup}>
                                <User className={Styles.inputIcon} size={20} />
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    value={registrationData.name}
                                    onChange={(e) => setRegistrationData({ ...registrationData, name: e.target.value })}
                                />
                            </div>
                            {!registrationData.email && (
                                <div className={Styles.inputGroup}>
                                    <Mail className={Styles.inputIcon} size={20} />
                                    <TextField
                                        fullWidth
                                        label="Email Address (optional)"
                                        type="email"
                                        value={registrationData.email}
                                        onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })}
                                    />
                                </div>
                            )}
                            <div className={Styles.inputGroup}>
                                <School className={Styles.inputIcon} size={20} />
                                <TextField
                                    fullWidth
                                    label="School Name"
                                    value={registrationData.schoolName}
                                    onChange={(e) => setRegistrationData({ ...registrationData, schoolName: e.target.value })}
                                />
                            </div>
                            <div className={Styles.inputGroup}>
                                <MapPin className={Styles.inputIcon} size={20} />
                                <TextField
                                    fullWidth
                                    label="City"
                                    value={registrationData.city}
                                    onChange={(e) => setRegistrationData({ ...registrationData, city: e.target.value })}
                                />
                            </div>
                            <div className={Styles.inputGroup}>
                                <GraduationCap className={Styles.inputIcon} size={20} />
                                <FormControl fullWidth>
                                    <InputLabel>Grade</InputLabel>
                                    <Select
                                        value={registrationData.grade}
                                        label="Grade"
                                        onChange={(e) => setRegistrationData({ ...registrationData, grade: e.target.value })}
                                    >
                                        {[...Array(10)].map((_, i) => (
                                            <MenuItem key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>
                        </form>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={auth.currentUser?.providerData[0]?.providerId === 'google.com' ? handleGoogleRegister : handlePhoneRegister}
                            disabled={loading}
                            className={Styles.actionButton}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Create Profile"}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AuthModal;
