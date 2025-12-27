"use client";
import { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Gift, Sparkles, User, BookOpen, Phone, Download, Mail, School, Users, Briefcase } from "lucide-react";
import { Button } from "@mui/material";
import Confetti from "canvas-confetti";
import { toPng } from 'html-to-image';
import { ref, push, set, get } from "firebase/database";
import { firebaseDatabase } from "@/backend/firebaseHandler";
import Navigation from "@/components/Navigation/Navigation.component";
import Footer from "@/components/Footer/Footer.component";


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
    const [ticketCode, setTicketCode] = useState(null);
    const [registrationType, setRegistrationType] = useState('parent'); // 'parent' | 'student' | 'teacher' | 'other'
    const [hasChildren, setHasChildren] = useState(true); // Only for parents
    const [emailSending, setEmailSending] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userName, setUserName] = useState('');
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

    // Constants
    const GRADE_OPTIONS = ["Pre-KG", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)];
    const SCHOOL_OPTIONS = ["Learners Global School ", "Learners PU College-Sathagalli", "Learners PU College-Vijayanagar", "Others"];

    const onSubmit = async (data) => {
        // Base payload
        const payload = {
            phoneNumber: data.phoneNumber,
            email: data.email,
            userType: registrationType,
            name: data.name,
            ticketCode: null, // to be generated
            createdAt: new Date().toISOString(),
            timestamp: Date.now(),
        };

        // Role-specific payload details
        if (registrationType === 'parent') {
            payload.hasChildren = hasChildren;
            if (hasChildren && data.students && data.students.length > 0) {
                // Save structured data
                payload.children = data.students;
                // Save flat strings for admin table compatibility
                payload.studentName = data.students.map(s => s.name).join(", ");
                payload.studentGrade = data.students.map(s => s.grade).join(", ");
                // Also save schools if needed for CSV
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
        } else {
            // Other - nothing extra
        }

        let newCode;

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

                // Count existing students of THIS specific grade to generate sequential number
                const countInGrade = regsArray.filter(reg =>
                    reg.userType === 'student' && reg.studentGrade === grade
                ).length;

                newCode = `${prefix}${offset + countInGrade + 1}`;

            } else {
                // Non-Student Logic
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
                        offset = 1000; // Treat as Guest if no children
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
            // Fallback
            newCode = `${registrationType.charAt(0).toUpperCase()}${Date.now().toString().slice(-4)}`;
        }

        setTicketCode(newCode);

        // Save to Firebase
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

        // Store user info for email
        setUserEmail(data.email);
        setUserName(data.name);

        Confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });

        setSubmitted(true);
    };

    // Send email with ticket
    const sendTicketEmail = async () => {
        if (!ticketRef.current || !userEmail || !ticketCode) {
            console.error('Missing required data for email');
            return;
        }

        setEmailSending(true);

        try {
            // Generate image from ticket
            const imageDataUrl = await toPng(ticketRef.current, { cacheBust: true });

            // Send to API
            const response = await fetch('/api/send-lottery-ticket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userEmail,
                    name: userName,
                    ticketCode: ticketCode,
                    imageDataUrl: imageDataUrl,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setEmailSent(true);
                console.log('Email sent successfully:', result);
            } else {
                console.error('Email sending failed:', result.error);
                alert(`Failed to send email: ${result.error}. Please download your ticket manually.`);
            }
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Failed to send email. Please download your ticket manually.');
        } finally {
            setEmailSending(false);
        }
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
            <Navigation />

            <main className="flex-grow container mx-auto px-4 py-12 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
                <div className="text-center md:text-left flex-1 animate-in fade-in slide-in-from-left duration-700 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm mb-6 border border-blue-200">
                        <Sparkles className="w-4 h-4" /> LEARNERS GLOBAL SCHOOL & PU COLLEGE
                    </div>

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
                            {['parent', 'student', 'teacher', 'Guest'].map((role) => (
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
                            ))}
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
                                variant="contained"
                                fullWidth
                                sx={{
                                    mt: 2,
                                    background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)',
                                    color: 'white',
                                    padding: '12px',
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem',
                                    textTransform: 'none',
                                    borderRadius: '8px',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #1d4ed8 0%, #0369a1 100%)',
                                        boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)'
                                    }
                                }}
                            >
                                Get Ticket
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

                            <p className="text-sm text-blue-100">
                                Keep this code safe! We will announce the winners soon.
                            </p>
                        </div>

                        {/* Email Status Message */}
                        {emailSent && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center animate-in fade-in slide-in-from-top-2">
                                <p className="text-green-700 font-semibold flex items-center justify-center gap-2">
                                    <Mail className="w-5 h-5" />
                                    Ticket sent to {userEmail}! ✅
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-8 flex flex-col gap-4 w-full px-4">
                            {/* Email Button */}
                            {!emailSent && (
                                <Button
                                    variant="contained"
                                    startIcon={<Mail />}
                                    onClick={sendTicketEmail}
                                    disabled={emailSending}
                                    sx={{
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                        color: 'white',
                                        padding: '12px',
                                        fontWeight: 'bold',
                                        textTransform: 'none',
                                        borderRadius: '8px',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
                                        },
                                        '&:disabled': {
                                            background: '#94a3b8',
                                            color: 'white'
                                        }
                                    }}
                                >
                                    {emailSending ? 'Sending Email...' : 'Email Ticket to Me'}
                                </Button>
                            )}

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
