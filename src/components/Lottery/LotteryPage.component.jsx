"use client";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Gift, Sparkles, User, BookOpen, Phone, Download, Trophy, Zap, GraduationCap } from "lucide-react";
import { Button } from "@mui/material";
import Confetti from "canvas-confetti";
import { toPng } from 'html-to-image';
import { ref, push, set, query, orderByChild, equalTo, get } from "firebase/database";
import { firebaseDatabase } from "@/backend/firebaseHandler";
import Navigation from "@/components/Navigation/Navigation.component";
import Footer from "@/components/Footer/Footer.component";


const LotteryPage = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [submitted, setSubmitted] = useState(false);
    const [ticketCode, setTicketCode] = useState(null);
    const [registrationType, setRegistrationType] = useState('parent'); // 'parent' | 'guest'
    const ticketRef = useRef(null);

    const onSubmit = async (data) => {
        // Prepare payload based on type
        const payload = {
            phoneNumber: data.phoneNumber,
            userType: registrationType,
            ticketCode: null, // to be generated
            // Common fields or specific ones
            ...(registrationType === 'parent' ? {
                parentName: data.parentName,
                studentName: data.studentName,
                studentGrade: data.studentGrade
            } : {
                studentName: data.guestName,
                parentName: "N/A", // Placeholder
                studentGrade: "Guest"
            })
        };

        let newCode;

        // Check if phone number already exists and get count
        try {
            const registrationsRef = ref(firebaseDatabase, 'Lottery/Registrations');
            // Index not defined on server, so we fetch all and filter client-side
            const snapshot = await get(registrationsRef);

            let count = 0;
            if (snapshot.exists()) {
                const allRegs = snapshot.val();
                const regsArray = Object.values(allRegs);
                count = regsArray.length;

                const existingEntry = regsArray.find(reg => reg.phoneNumber === data.phoneNumber);

                if (existingEntry) {
                    setTicketCode(existingEntry.ticketCode);
                    setSubmitted(true);
                    return;
                }
            }

            // Generate sequential code starting from 1000
            newCode = `LGS-${1000 + count + 1}`;

        } catch (error) {
            console.error("Error checking for duplicates:", error);
            // Fallback random if read fails, though unlikely to proceed well
            const characters = '0123456789';
            let randomSuffix = '';
            for (let i = 0; i < 4; i++) randomSuffix += characters.charAt(Math.floor(Math.random() * characters.length));
            newCode = `LGS-${randomSuffix}`;
        }

        setTicketCode(newCode);

        // Save to Firebase
        try {
            const registrationsRef = ref(firebaseDatabase, 'Lottery/Registrations');
            const newRegRef = push(registrationsRef);
            await set(newRegRef, {
                ...payload,
                ticketCode: newCode,
                timestamp: Date.now(),
                createdAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error saving registration:", error);
        }

        Confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });

        setSubmitted(true);
        reset();
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

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'radial-gradient(circle at 70% 50%, #ffffff 0%, #e0f2fe 100%)' }}>
            <Navigation />

            <main className="flex-grow container mx-auto px-4 py-12 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
                <div className="text-center md:text-left flex-1 animate-in fade-in slide-in-from-left duration-700 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm mb-6 border border-blue-200">
                        <Sparkles className="w-4 h-4" /> LEARNERS GLOBAL SCHOOL & PU COLLEGE
                    </div>

                    {/* <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-slate-900 leading-tight tracking-tight">
                        Lucky Parent Lottery
                        <span className="block text-3xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-2">
                            Annual Day Celebration!
                        </span>
                    </h1> */}

                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight
               text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                        Lucky Parent Lottery
                        <span className="block text-3xl md:text-5xl mt-2">
                            Annual Day Celebration!
                        </span>
                    </h1>


                    <p className="text-lg text-slate-600 mb-8 leading-relaxed font-medium">
                        "All registered parents will be included in a computerized random draw.
                        Selected parents will be announced live during the celebration."
                        <br />
                        <span className="text-sm text-slate-500 mt-2 block">Join us in celebrating a year of brilliance, creativity, and mathematical wonders!</span>
                    </p>
                </div>

                {!submitted ? (
                    <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-right duration-700">
                        <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Get Your Ticket</h2>

                        {/* Registration Type Toggle */}
                        <div className="flex p-1 bg-slate-100 rounded-lg mb-6">
                            <button
                                type="button"
                                onClick={() => setRegistrationType('parent')}
                                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${registrationType === 'parent'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Parent
                            </button>
                            <button
                                type="button"
                                onClick={() => setRegistrationType('guest')}
                                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${registrationType === 'guest'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Guest
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                            {registrationType === 'parent' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 ml-1 text-slate-700">Parent Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                {...register("parentName", { required: "Parent name is required" })}
                                                className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 text-slate-900"
                                                placeholder="Enter parent's name"
                                            />
                                        </div>
                                        {errors.parentName && <span className="text-red-500 text-xs ml-1 mt-1">{errors.parentName.message}</span>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1 ml-1 text-slate-700">Student Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                {...register("studentName", { required: "Student name is required" })}
                                                className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 text-slate-900"
                                                placeholder="Enter student's name"
                                            />
                                        </div>
                                        {errors.studentName && <span className="text-red-500 text-xs ml-1 mt-1">{errors.studentName.message}</span>}
                                    </div>
                                </>
                            )}

                            {registrationType === 'guest' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1 ml-1 text-slate-700">Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            {...register("guestName", { required: "Name is required" })}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 text-slate-900"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    {errors.guestName && <span className="text-red-500 text-xs ml-1 mt-1">{errors.guestName.message}</span>}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1 ml-1 text-slate-700">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        {...register("phoneNumber", {
                                            required: "Phone number is required",
                                            pattern: { value: /^[0-9]{10}$/, message: "Valid 10-digit number required" }
                                        })}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 text-slate-900"
                                        placeholder="Enter 10-digit number"
                                        type="tel"
                                    />
                                </div>
                                {errors.phoneNumber && <span className="text-red-500 text-xs ml-1 mt-1">{errors.phoneNumber.message}</span>}
                                <p className="text-slate-500 text-xs ml-1 mt-1">Note: Only one ticket allowed per phone number.</p>
                            </div>

                            {registrationType === 'parent' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1 ml-1 text-slate-700">Student Grade</label>
                                    <div className="relative">
                                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <select
                                            {...register("studentGrade", { required: "Grade is required" })}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none text-slate-900"
                                        >
                                            <option value="" className="text-slate-500">Select Grade</option>
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                                                <option key={g} value={g} className="text-slate-900">Grade {g}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.studentGrade && <span className="text-red-500 text-xs ml-1 mt-1">{errors.studentGrade.message}</span>}
                                </div>
                            )}

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                sx={{
                                    mt: 2,
                                    background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)', // Match Home Page Blue Gradient
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
                                <p className="text-sm mb-2 uppercase tracking-wider font-semibold text-yellow-200">Your Ticket Code</p>
                                <p className="text-4xl font-mono font-bold tracking-widest drop-shadow-md text-yellow-400">
                                    {ticketCode}
                                </p>
                            </div>

                            <p className="text-sm text-blue-100">
                                Keep this code safe! We will announce the winners soon.
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
