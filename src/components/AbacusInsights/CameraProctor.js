"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';

const CameraProctor = ({ sessionId, onViolation }) => {
    const videoRef = useRef(null);
    const [status, setStatus] = useState('initializing'); // initializing, active, denied, error
    const [stream, setStream] = useState(null);

    useEffect(() => {
        async function startCamera() {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 320 },
                        height: { ideal: 240 },
                        facingMode: "user"
                    }
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
                setStream(mediaStream);
                setStatus('active');
            } catch (err) {
                console.error("Camera access error:", err);
                setStatus('denied');
                onViolation({
                    type: 'camera_denied',
                    details: 'Student denied camera access or no camera found.',
                    timestamp: new Date().toISOString()
                });
            }
        }

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Monitor stream health
    useEffect(() => {
        if (!stream) return;

        const checkStream = setInterval(() => {
            const videoTrack = stream.getVideoTracks()[0];
            if (!videoTrack || !videoTrack.enabled || videoTrack.readyState === 'ended') {
                setStatus('error');
                onViolation({
                    type: 'camera_failure',
                    details: 'Webcam stream was disconnected or disabled.',
                    timestamp: new Date().toISOString()
                });
            }
        }, 5000);

        return () => clearInterval(checkStream);
    }, [stream, onViolation]);

    return (
        <div className="fixed bottom-6 right-6 z-[100] group animate-in slide-in-from-right-8 duration-300">
            <div className={`relative overflow-hidden rounded-2xl shadow-2xl border-2 transition-all duration-300 w-48 h-36 ${status === 'active' ? 'border-indigo-500 shadow-indigo-200/50' :
                    status === 'denied' || status === 'error' ? 'border-red-500 shadow-red-200/50' :
                        'border-slate-300'
                }`}>
                {/* Video Feed */}
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`w-full h-full object-cover transition-opacity duration-500 ${status === 'active' ? 'opacity-100' : 'opacity-0 bg-slate-100'}`}
                />

                {/* Status Overlays */}
                {status !== 'active' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-slate-50/90 text-slate-500">
                        {status === 'initializing' ? (
                            <div className="animate-pulse flex flex-col items-center">
                                <Camera className="mb-2 text-indigo-400" />
                                <span className="text-[10px] uppercase font-black">Initializing...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-red-500">
                                <CameraOff size={24} className="mb-2" />
                                <span className="text-[10px] font-black leading-tight">CAMERA BLOCKED</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Monitoring Badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 bg-black/50 backdrop-blur-md rounded-full">
                    <div className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className="text-[8px] font-black text-white uppercase tracking-wider">Live Monitoring</span>
                </div>

                {/* Violation Warning Alert (shown only when error) */}
                {(status === 'denied' || status === 'error') && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-red-600 text-white text-[9px] font-bold text-center">
                        VIOLATION LOGGED
                    </div>
                )}
            </div>

            {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800 text-white text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-slate-700">
                Secure Exam Monitoring Active
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45 border-r border-b border-slate-700"></div>
            </div>
        </div>
    );
};

export default CameraProctor;
