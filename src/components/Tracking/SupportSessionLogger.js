
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { db } from '../../backend/firebaseHandler';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ROLES } from '../../utils/permissions';
import { Loader2, Save, Clock } from 'lucide-react';

export default function SupportSessionLogger() {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setSuccessMessage('');

        try {
            await addDoc(collection(db, "support_sessions"), {
                learner_id: data.learnerId, // Ideally this is a selection from a list
                role_type: data.roleType,
                duration_minutes: parseInt(data.duration, 10),
                activity_type: data.activityType,
                reflection_note: data.reflection,
                timestamp: serverTimestamp(),
                // In a real app, we'd add the current user's ID and School ID here
                // supporter_user_id: user.uid,
                // school_id: user.linked_school_id 
            });

            setSuccessMessage("Session logged successfully! Thank you for your support.");
            reset();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error("Error logging session:", error);
            alert("Failed to log session. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-8">
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                    <Clock size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Log Support Session</h3>
                    <p className="text-xs text-gray-500">Track your time and impact with a learner.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Learner Name / ID</label>
                        <input
                            type="text"
                            {...register("learnerId", { required: "Learner is required" })}
                            className="w-full rounded-lg border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter Learner Name/ID"
                        />
                        {errors.learnerId && <p className="text-xs text-red-500 mt-1">{errors.learnerId.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Role Context</label>
                        <select
                            {...register("roleType", { required: "Role is required" })}
                            className="w-full rounded-lg border-gray-300 border p-2 text-sm"
                        >
                            <option value="">Select your role for this session</option>
                            <option value={ROLES.TEACHER_GUIDE}>Teacher Guide</option>
                            <option value={ROLES.PARENT_SUPPORTER}>Parent Supporter</option>
                            <option value={ROLES.MATH_COMPANION}>Math Companion</option>
                            <option value={ROLES.MATH_CONNECTOR}>Math Connector</option>
                            <option value={ROLES.MATH_MENTOR}>Math Mentor</option>
                            <option value={ROLES.CLASS_TEACHER}>Class Teacher</option>
                        </select>
                        {errors.roleType && <p className="text-xs text-red-500 mt-1">{errors.roleType.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Minutes)</label>
                        <input
                            type="number"
                            {...register("duration", { required: "Duration is required", min: 1 })}
                            className="w-full rounded-lg border-gray-300 border p-2 text-sm"
                            placeholder="30"
                        />
                        {errors.duration && <p className="text-xs text-red-500 mt-1">{errors.duration.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                        <select
                            {...register("activityType", { required: "Activity type is required" })}
                            className="w-full rounded-lg border-gray-300 border p-2 text-sm"
                        >
                            <option value="Sitting Along">Sitting Along (Companion)</option>
                            <option value="Guidance">Guidance / Mentoring</option>
                            <option value="Introduction">Introduction / Onboarding</option>
                            <option value="Review">Reviewing Reports</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reflection / Notes <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <textarea
                        {...register("reflection")}
                        rows={2}
                        className="w-full rounded-lg border-gray-300 border p-2 text-sm"
                        placeholder="How did it go? Any observations?"
                    />
                </div>

                {successMessage && (
                    <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center">
                        <Save className="w-4 h-4 mr-2" />
                        {successMessage}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            Logging Session...
                        </>
                    ) : (
                        'Log Session'
                    )}
                </button>
            </form>
        </div>
    );
}
