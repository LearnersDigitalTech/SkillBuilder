"use client";
import { useState, useRef, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Gift, Sparkles, User, BookOpen, Phone, Download, Mail, School, Users, Briefcase } from "lucide-react";
import { Button } from "@mui/material";
import Confetti from "canvas-confetti";
import { toPng } from 'html-to-image';
import { ref, push, set, get } from "firebase/database";
import { firebaseDatabase, auth } from "@/backend/firebaseHandler";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import Header from "@/app/homepage/Header";
import Footer from "@/components/Footer/Footer.component";


import { toast } from 'react-toastify';


const LotteryPage = () => {
    const { register, control, handleSubmit, formState: { errors }, reset, watch, unregister } = useForm({
        defaultValues: {
            students: [{ name: "", grade: "" }]
        }
    });
    const { fields, append, remove } = useFieldArray({
        control,
        name: "students"
    });

    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ticketCode, setTicketCode] = useState(null);
    const [registrationType, setRegistrationType] = useState('parent'); // 'parent' | 'student' | 'teacher' | 'other'
    const [roleVisibility, setRoleVisibility] = useState({
        parent: true,
        student: true,
        teacher: true,
        Guest: true
    });
    const [hasChildren, setHasChildren] = useState(true); // Only for parents
    const ticketRef = useRef(null);

    // Watch values for conditional logic if needed
    // const watchHasChildren = watch("hasChildren"); 

    const handleRoleChange = (role) => {
        setRegistrationType(role);
        setHasChildren(true); // Reset this to true by default
        reset({
            students: [{ name: "", grade: "" }]
        }); // Clear form errors and values when switching roles
    };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settingsRef = ref(firebaseDatabase, 'Lottery/Config/RoleVisibility');
                const snapshot = await get(settingsRef);
                if (snapshot.exists()) {
                    const settings = snapshot.val();
                    setRoleVisibility(settings);

                    // If current role is hidden, switch to first visible role
                    const roles = ['parent', 'student', 'teacher', 'Guest'];
                    if (!settings[registrationType.toLowerCase()]) {
                        const firstVisible = roles.find(r => settings[r.toLowerCase()]);
                        if (firstVisible) setRegistrationType(firstVisible);
                    }
                }
            } catch (error) {
                console.error("Error fetching lottery settings:", error);
            }
        };
        fetchSettings();
    }, []);

    // Constants
    const GRADE_OPTIONS = ["Pre-KG", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)];
    const SCHOOL_OPTIONS = ["Learners Global School ", "Learners PU College-Sathagalli", "Learners PU College-Vijayanagar", "Others"];

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        let newCode;
        let createdUserUid = null;

        // Check for duplicate phone number AND email within the SAME ROLE
        try {
            const registrationsRef = ref(firebaseDatabase, 'Lottery/Registrations');
            const snapshot = await get(registrationsRef);
            const allRegs = snapshot.exists() ? snapshot.val() : {};
            const regsArray = Object.values(allRegs);

            // Check if phone number OR email already exists for THIS ROLE
            const existingRegistration = regsArray.find(reg =>
                reg.userType === registrationType &&
                (reg.phoneNumber === data.phoneNumber || reg.email === data.email)
            );

            if (existingRegistration) {
                // Show existing ticket instead of blocking
                setTicketCode(existingRegistration.ticketCode);
                setSubmitted(true);

                toast.info(`You are already registered as ${registrationType}! Here's your existing ticket.`, {
                    position: "top-center",
                    autoClose: 5000,
                });

                Confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                });

                setIsSubmitting(false);
                return; // Stop here and show existing ticket
            }
        } catch (error) {
            console.error("Error checking registration uniqueness:", error);
            toast.error("Unable to verify registration. Please try again.");
            setIsSubmitting(false);
            return;
        }

        // Ticket Generation Logic
        try {
            const registrationsRef = ref(firebaseDatabase, 'Lottery/Registrations');
            const snapshot = await get(registrationsRef);
            const allRegs = snapshot.exists() ? snapshot.val() : {};
            const regsArray = Object.values(allRegs);

            if (registrationType === 'student') {
                const prefix = 'S';
                let offset = 0;
                const grade = data.studentGrade;

                if (grade === "Pre-KG") offset = 100;
                else if (grade === "LKG") offset = 300;
                else if (grade === "UKG") offset = 600;
                else {
                    const match = String(grade).match(/(\d+)/);
                    if (match) {
                        offset = parseInt(match[1]) * 1000;
                    } else {
                        offset = 9000; // Fallback
                    }
                }

                const countInGrade = regsArray.filter(reg =>
                    reg.userType === 'student' && reg.studentGrade === grade
                ).length;

                newCode = `${prefix}${offset + countInGrade + 1}`;

            } else {
                let offset = 1000;
                let prefix = 'P';

                if (registrationType === 'teacher') {
                    offset = 1000;
                    prefix = 'T';
                } else if (registrationType === 'Guest') {
                    offset = 1000;
                    prefix = 'G';
                } else if (registrationType === 'parent') {
                    if (!hasChildren) {
                        offset = 1000;
                        prefix = 'G';
                    } else {
                        offset = 1000;
                        prefix = 'P';
                    }
                }

                const typeCount = regsArray.filter(reg =>
                    reg.ticketCode && reg.ticketCode.startsWith(prefix)
                ).length;

                newCode = `${prefix}${offset + typeCount + 1}`;
            }

        } catch (error) {
            console.error("Error generating ticket:", error);
            newCode = `${registrationType.charAt(0).toUpperCase()}${Date.now().toString().slice(-4)}`;
        }

        // Create User in Firebase Auth with Ticket Code as Password AND UserID (dummy email)
        try {
            // User ID: S1001 -> S1001@lgs.com
            // Password: LGS + S1001 -> LGSS1001
            const authEmail = `${newCode}@lgs.com`;
            const authPassword = `LGS${newCode}`;

            const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
            createdUserUid = userCredential.user.uid;

        } catch (authError) {
            if (authError.code === 'auth/email-already-in-use') {
                // User already exists - try to sign in to get their UID
                console.log(`User ${newCode} already exists in Firebase Auth. Attempting to sign in...`);
                try {
                    const authEmail = `${newCode}@lgs.com`;
                    const authPassword = `LGS${newCode}`;
                    const { signInWithEmailAndPassword } = await import("firebase/auth");
                    const signInResult = await signInWithEmailAndPassword(auth, authEmail, authPassword);
                    createdUserUid = signInResult.user.uid;
                    console.log(`✅ Successfully signed in existing user: ${newCode} (UID: ${createdUserUid})`);

                    toast.info(`User ID ${newCode} already exists. Updating registration data.`, {
                        position: "top-center",
                        autoClose: 3000,
                    });
                } catch (signInError) {
                    console.error("Failed to sign in existing user:", signInError);
                    toast.error(`User ${newCode} exists but sign-in failed. Please contact support.`);
                    setIsSubmitting(false);
                    return;
                }
            } else if (authError.code === 'auth/operation-not-allowed') {
                console.error("Firebase Auth Error: Email/Password provider disabled.");
                toast.error("System Error: Login provider disabled. Contact support.");
                setIsSubmitting(false);
                return;
            } else {
                console.error("User creation failed:", authError);
                toast.error(`Registration failed: ${authError.message}`);
                setIsSubmitting(false);
                return;
            }
        }


        // Prepare Payload
        const payload = {
            phoneNumber: data.phoneNumber,
            email: data.email,
            userType: registrationType,
            name: data.name,
            ticketCode: newCode,
            createdAt: new Date().toISOString(),
            timestamp: Date.now(),
        };

        // Role-specific payload details
        if (registrationType === 'parent') {
            payload.hasChildren = hasChildren;
            if (hasChildren && data.students && data.students.length > 0) {
                payload.children = data.students;
                payload.studentName = data.students.map(s => s.name).join(", ");
                payload.studentGrade = data.students.map(s => s.grade).join(", ");
                payload.studentSchool = data.students.map(s => s.school).join(", ");
            } else {
                payload.studentName = "N/A";
                payload.studentGrade = "N/A";
                payload.profession = data.profession;
            }
        } else if (registrationType === 'student') {
            payload.studentGrade = data.studentGrade;
            payload.schoolName = data.schoolName;
        } else if (registrationType === 'teacher') {
            payload.schoolName = data.schoolName;
        } else if (registrationType === 'Guest') {
            payload.profession = data.profession;
        }


        // Save to Lottery Registrations (Admin View)
        try {
            const registrationsRef = ref(firebaseDatabase, 'Lottery/Registrations');
            const newRegRef = push(registrationsRef);
            await set(newRegRef, {
                ...payload,
                ticketCode: newCode
            });
        } catch (error) {
            console.error("Error saving registration:", error);
        }

        // Sync to NMD_2025/Registrations (Login Access)
        if (createdUserUid) {
            try {
                // Construct structure compatible with AuthModal
                let authPayload = {
                    authProvider: "email",
                    parentEmail: data.email,
                    parentPhone: data.phoneNumber,
                    phoneNumber: data.phoneNumber,
                    userType: registrationType, // CRITICAL: Include userType for teacher detection
                    name: data.name,
                    ticketCode: newCode,
                    createdAt: new Date().toISOString()
                };

                if (registrationType === 'parent' && hasChildren && data.students) {
                    const childrenObj = {};
                    data.students.forEach((child, idx) => {
                        const childId = `student_${Date.now()}_${idx}`;
                        childrenObj[childId] = {
                            name: child.name,
                            grade: child.grade,
                            school: child.school,
                            email: data.email
                        };
                    });
                    authPayload.children = childrenObj;
                } else if (registrationType === 'student') {
                    const childId = `student_${Date.now()}`;
                    authPayload.children = {
                        [childId]: {
                            name: data.name,
                            grade: data.studentGrade,
                            role: 'student',
                            school: data.schoolName,
                            email: data.email
                        }
                    };
                } else if (registrationType === 'teacher') {
                    // Teachers don't have children - store teacher-specific data
                    authPayload.schoolName = data.schoolName;
                    // Do NOT create children object for teachers
                } else {
                    // Other user types (if any)
                    const profileId = `user_${Date.now()}`;
                    authPayload.children = {
                        [profileId]: {
                            name: data.name,
                            grade: "N/A",
                            role: registrationType,
                            email: data.email
                        }
                    };
                }

                // Store directly under the User ID (e.g., S1001) as requested
                await set(ref(firebaseDatabase, `NMD_2025/Registrations/${newCode}`), authPayload);

                // ALSO Store under UID to ensure Dashboard and Permissions work correctly
                await set(ref(firebaseDatabase, `NMD_2025/Registrations/${createdUserUid}`), authPayload);


                // Sign out immediately to prevent auto-login
                await signOut(auth);

            } catch (syncError) {
                console.error("Error syncing to NMD_2025:", syncError);
            }
        }

        // For teachers, sign them out immediately so they have to manually log in
        // This ensures proper routing to teacher dashboard with correct navbar
        if (registrationType === 'teacher') {
            try {
                const { signOut } = await import("firebase/auth");
                const { auth } = await import("@/backend/firebaseHandler");
                await signOut(auth);
                console.log("👨‍🏫 Teacher signed out after registration - must login manually");
            } catch (signOutError) {
                console.error("Error signing out teacher:", signOutError);
            }
        }

        setTicketCode(newCode);

        Confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });

        setSubmitted(true);
        setIsSubmitting(false);
    };

    const handleDownload = async () => {
        if (!ticketRef.current) return;

        try {
            const dataUrl = await toPng(ticketRef.current, { cacheBust: true });
            const link = document.createElement('a');
            link.download = `LotteryTicket-${ticketCode}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Ticket download failed:", error);
            alert("Failed to download ticket. Please try again.");
        }
    };

    // Helper for input styles
    const inputClass = "w-full pl-10 pr-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 text-slate-900";
    const labelClass = "block text-sm font-medium mb-1 ml-1 text-slate-700";

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'radial-gradient(circle at 70% 50%, #ffffff 0%, #e0f2fe 100%)' }}>
            <Header />

            <main className="flex-grow container mx-auto px-4 py-12 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
                <div className="text-center md:text-left flex-1 animate-in fade-in slide-in-from-left duration-700 max-w-2xl">
                    {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm mb-6 border border-blue-200">
                        <Sparkles className="w-4 h-4" /> LEARNERS GLOBAL SCHOOL & PU COLLEGE
                    </div> */}

                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight
               text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                        {registrationType === 'student' ? 'Lucky Student' : registrationType === 'teacher' ? 'Lucky Teacher' : registrationType === 'parent' ? 'Lucky Parent' : 'Lucky Guest'} Lottery
                        <span className="block text-3xl md:text-5xl mt-2 text-slate-800">
                            Annual Day Celebration!
                        </span>
                    </h1>

                    <p className="text-lg text-slate-600 mb-8 leading-relaxed font-medium">
                        "Join the celebration! Register now to receive your lucky draw ticket.
                        Winners will be announced live during the event."
                    </p>
                </div>

                {!submitted ? (
                    <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-right duration-700">
                        <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Get Your Ticket</h2>

                        {/* Role Tabs */}
                        <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-lg mb-6">
                            {['parent', 'student', 'teacher', 'Guest'].map((role) => {
                                if (roleVisibility[role.toLowerCase()] === false) return null;
                                return (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => handleRoleChange(role)}
                                        className={`flex-1 min-w-[70px] py-2 text-xs md:text-sm font-semibold rounded-md transition-all capitalize ${registrationType === role
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {role}
                                    </button>
                                );
                            })}
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                            {/* Common: Name */}
                            <div>
                                <label className={labelClass}>Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        {...register("name", { required: "Name is required" })}
                                        className={inputClass}
                                        placeholder="Enter full name"
                                    />
                                </div>
                                {errors.name && <span className="text-red-500 text-xs ml-1 mt-1">{errors.name.message}</span>}
                            </div>

                            {/* Common: Phone */}
                            <div>
                                <label className={labelClass}>Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        {...register("phoneNumber", {
                                            required: "Phone number is required",
                                            pattern: { value: /^[0-9]{10}$/, message: "Valid 10-digit number required" }
                                        })}
                                        className={inputClass}
                                        placeholder="Enter 10-digit number"
                                        type="tel"
                                        maxLength={10}
                                    />
                                </div>
                                {errors.phoneNumber && <span className="text-red-500 text-xs ml-1 mt-1">{errors.phoneNumber.message}</span>}
                            </div>

                            {/* Common: Email */}
                            <div>
                                <label className={labelClass}>Email ID</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                                        })}
                                        className={inputClass}
                                        placeholder="Enter email address"
                                        type="email"
                                    />
                                </div>
                                {errors.email && <span className="text-red-500 text-xs ml-1 mt-1">{errors.email.message}</span>}
                            </div>

                            {/* === Role Specific Fields === */}

                            {/* PARENT: Children Question */}
                            {registrationType === 'parent' && (
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <label className="block text-sm font-medium mb-2 text-slate-700">Do you have children currently studying between pre-KG and Class 12?</label>
                                    <div className="flex gap-6 mb-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="hasChildren"
                                                checked={hasChildren === true}
                                                onChange={() => setHasChildren(true)}
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-slate-700">Yes</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="hasChildren"
                                                checked={hasChildren === false}
                                                onChange={() => setHasChildren(false)}
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-slate-700">No</span>
                                        </label>
                                    </div>

                                    {/* Conditional fields for Parent -> Children */}
                                    {hasChildren && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                            {fields.map((field, index) => (
                                                <div key={field.id} className="p-3 bg-white rounded-md border border-slate-200 shadow-sm relative">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs font-bold text-slate-500 uppercase">Child {index + 1}</span>
                                                        {fields.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => remove(index)}
                                                                className="text-red-500 text-xs hover:text-red-700"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="space-y-3">
                                                        {/* Child Name */}
                                                        <div>
                                                            <label className={labelClass}>Student Name</label>
                                                            <div className="relative">
                                                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                                <input
                                                                    {...register(`students.${index}.name`, { required: "Student name is required" })}
                                                                    className={inputClass}
                                                                    placeholder="Enter student's name"
                                                                />
                                                            </div>
                                                            {errors.students?.[index]?.name && <span className="text-red-500 text-xs ml-1 mt-1">{errors.students[index].name.message}</span>}
                                                        </div>

                                                        {/* Child Grade */}
                                                        <div>
                                                            <label className={labelClass}>Grade</label>
                                                            <div className="relative">
                                                                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                                <select
                                                                    {...register(`students.${index}.grade`, { required: "Grade is required" })}
                                                                    className={inputClass}
                                                                >
                                                                    <option value="">Select Grade</option>
                                                                    {GRADE_OPTIONS.map((g) => (
                                                                        <option key={g} value={g}>{g}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            {errors.students?.[index]?.grade && <span className="text-red-500 text-xs ml-1 mt-1">{errors.students[index].grade.message}</span>}
                                                        </div>

                                                        {/* Child School */}
                                                        <div>
                                                            <label className={labelClass}>School Name</label>
                                                            <div className="relative">
                                                                <School className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                                <select
                                                                    {...register(`students.${index}.school`, { required: "School is required" })}
                                                                    className={inputClass}
                                                                >
                                                                    <option value="">Select School</option>
                                                                    {SCHOOL_OPTIONS.map((s) => (
                                                                        <option key={s} value={s}>{s}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            {errors.students?.[index]?.school && <span className="text-red-500 text-xs ml-1 mt-1">{errors.students[index].school.message}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            <Button
                                                type="button"
                                                variant="outlined"
                                                size="small"
                                                onClick={() => append({ name: "", grade: "", school: "" })}
                                                sx={{ textTransform: 'none', mt: 1 }}
                                            >
                                                + Add Another Child
                                            </Button>
                                        </div>
                                    )}

                                    {/* If Parent selects NO children -> Show Profession */}
                                    {!hasChildren && (
                                        <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                            <label className={labelClass}>Profession</label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    {...register("profession", { required: !hasChildren ? "Profession is required" : false })}
                                                    className={inputClass}
                                                    placeholder="Enter your profession"
                                                />
                                            </div>
                                            {errors.profession && <span className="text-red-500 text-xs ml-1 mt-1">{errors.profession.message}</span>}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STUDENT Role Fields */}
                            {registrationType === 'student' && (
                                <>
                                    <div>
                                        <label className={labelClass}>Grade</label>
                                        <div className="relative">
                                            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <select
                                                {...register("studentGrade", { required: "Grade is required" })}
                                                className={inputClass}
                                            >
                                                <option value="">Select Grade</option>
                                                {GRADE_OPTIONS.map((g) => (
                                                    <option key={g} value={g}>{g}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.studentGrade && <span className="text-red-500 text-xs ml-1 mt-1">{errors.studentGrade.message}</span>}
                                    </div>
                                    <div>
                                        <label className={labelClass}>School Name</label>
                                        <div className="relative">
                                            <School className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <select
                                                {...register("schoolName", { required: "School name is required" })}
                                                className={inputClass}
                                            >
                                                <option value="">Select School</option>
                                                {SCHOOL_OPTIONS.map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.schoolName && <span className="text-red-500 text-xs ml-1 mt-1">{errors.schoolName.message}</span>}
                                    </div>
                                </>
                            )}

                            {/* TEACHER Role Fields */}
                            {registrationType === 'teacher' && (
                                <div>
                                    <label className={labelClass}>School Name</label>
                                    <div className="relative">
                                        <School className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <select
                                            {...register("schoolName", { required: "School Name is required" })}
                                            className={inputClass}
                                        >
                                            <option value="">Select School</option>
                                            {SCHOOL_OPTIONS.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.schoolName && <span className="text-red-500 text-xs ml-1 mt-1">{errors.schoolName.message}</span>}
                                </div>
                            )}

                            {/* GUEST Role Fields */}
                            {registrationType === 'Guest' && (
                                <div>
                                    <label className={labelClass}>Profession</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            {...register("profession", { required: "Profession is required" })}
                                            className={inputClass}
                                            placeholder="Enter your profession"
                                        />
                                    </div>
                                    {errors.profession && <span className="text-red-500 text-xs ml-1 mt-1">{errors.profession.message}</span>}
                                </div>
                            )}

                            {/* OTHER: No extra fields */}



                            <Button
                                type="submit"
                                disabled={isSubmitting} // Disable while submitting
                                variant="contained"
                                fullWidth
                                sx={{
                                    mt: 2,
                                    background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)',
                                    color: 'white',
                                    padding: '12px',
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem',
                                    textTransform: 'none',
                                    borderRadius: '8px',
                                    '&:hover': {
                                        background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #1d4ed8 0%, #0369a1 100%)',
                                        boxShadow: isSubmitting ? 'none' : '0 10px 15px -3px rgba(37, 99, 235, 0.3)'
                                    }
                                }}
                            >
                                {isSubmitting ? 'Generating Ticket...' : 'Get Ticket'}
                            </Button>
                        </form>
                    </div>
                ) : (
                    <div className="flex flex-col items-center w-full max-w-md animate-in zoom-in duration-300">
                        {/* Ticket Card Area - This is what gets downloaded */}
                        <div
                            ref={ticketRef}
                            className="w-full p-8 rounded-2xl border-4 border-yellow-400/30 text-center shadow-2xl relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white"
                        >
                            {/* Decorative circles */}
                            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950"></div>
                            <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950"></div>

                            <div className="p-4 rounded-full inline-block mb-4 bg-white/10 text-yellow-400">
                                <Gift className="w-12 h-12" />
                            </div>

                            <h2 className="text-2xl font-bold mb-2 text-white">Registration Successful!</h2>

                            <div className="my-6 p-4 rounded-xl border-2 border-dashed border-yellow-400/50 bg-white/5">
                                <p className="text-sm mb-2 uppercase tracking-wider font-semibold text-yellow-200">Your Lucky Number</p>
                                <p className="text-4xl font-mono font-bold tracking-widest drop-shadow-md text-yellow-400">
                                    {ticketCode}
                                </p>
                            </div>

                            {/* Credentials Display */}
                            <div className="bg-white/10 rounded-xl p-3 mb-4 text-left border border-white/20">
                                <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold mb-2 text-center border-b border-white/10 pb-1">Login Credentials</p>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-slate-300">User ID:</span>
                                    <span className="font-mono font-bold text-white text-lg">{ticketCode}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-300">Password:</span>
                                    <span className="font-mono font-bold text-white text-lg">LGS{ticketCode}</span>
                                </div>
                            </div>

                            <p className="text-sm text-blue-100">
                                Please keep this code secure. The winners will be announced shortly.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 flex flex-col gap-4 w-full px-4">
                            <Button
                                variant="contained"
                                startIcon={<Download />}
                                onClick={handleDownload}
                                sx={{
                                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                    color: 'white',
                                    padding: '12px',
                                    fontWeight: 'bold',
                                    textTransform: 'none',
                                    borderRadius: '8px',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                                        boxShadow: '0 0 15px rgba(34, 197, 94, 0.4)'
                                    }
                                }}
                            >
                                Download Ticket
                            </Button>

                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setSubmitted(false);
                                    setTicketCode(null);
                                    reset();
                                }}
                                sx={{
                                    color: '#2563eb', // Blue text for light mode
                                    borderColor: '#2563eb',
                                    padding: '10px',
                                    '&:hover': { borderColor: '#1d4ed8', background: '#eff6ff' }
                                }}
                            >
                                Register Another
                            </Button>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default LotteryPage;
