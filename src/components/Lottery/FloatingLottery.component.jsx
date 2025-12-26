"use client";
import { Gift } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const FloatingLottery = () => {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Delay appearance slightly for effect
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleClick = () => {
        router.push("/lottery");
    };

    if (!isVisible) return null;

    return (
        <div
            className="fixed bottom-8 right-8 z-50 animate-bounce cursor-pointer transition-transform hover:scale-110"
            onClick={handleClick}
            title="Get your Lucky Number"
        >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-3 rounded-full shadow-lg border-4 border-white flex items-center gap-2">
                <Gift className="text-white w-6 h-6" />
                <span className="text-white font-bold text-lg">Get your Lucky Number</span>
            </div>
        </div>
    );
};

export default FloatingLottery;
