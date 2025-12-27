"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Infinity, Calendar, Heart, Play, X } from "lucide-react";
import Image from "next/image";

const ContextSection = () => {
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

    const getVideoId = (url: string) => {
        if (url.includes("youtu.be")) return url.split("youtu.be/")[1]?.split("?")[0];
        if (url.includes("shorts")) return url.split("shorts/")[1]?.split("?")[0];
        return url.split("v=")[1]?.split("&")[0];
    };

    return (
        <section className="py-20 md:py-28 bg-[#F8FBFF] relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#0096FF]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#FF9F43]/5 rounded-full blur-3xl" />
            </div>

            <div className="container px-4 relative z-10">
                <motion.div
                    className="max-w-4xl mx-auto text-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white shadow-sm border border-blue-100">
                        {/* <Calendar className="w-4 h-4 text-[#0096FF]" /> */}
                        <span className="text-sm font-medium text-[#0B2545]/70">December 22 • National Mathematics Day &emsp;&emsp;&emsp; International Day of Mathematics • March 14</span>
                        {/* <Calendar className="w-4 h-4 text-[#0096FF]" /> */}
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 text-[#0B2545]">
                        Inspired by <span className="text-[#FF9F43]">Ramanujan's</span> Legacy
                    </h2>

                    <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 border border-blue-50 mb-8">
                        {/* <div className="flex justify-center mb-6">
                            <div className="w-24 h-24 rounded-full bg-[#FF9F43]/10 flex items-center justify-center relative overflow-hidden">
                                <Image
                                    src="/HeroIllustration.gif"
                                    alt="Math Illustration"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        </div> */}

                        <blockquote className="text-xl md:text-2xl text-[#0B2545] italic mb-6 leading-relaxed">
                            "An equation for me has no meaning unless it expresses a thought of God."
                        </blockquote>
                        <p className="text-[#0B2545]/60 font-medium">— Srinivasa Ramanujan</p>
                    </div>

                    <motion.p
                        className="text-lg md:text-xl text-[#0B2545]/70 leading-relaxed max-w-3xl mx-auto"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        On National Mathematics Day, we celebrate the genius of Srinivasa Ramanujan —
                        a self-taught mathematician whose curiosity changed the world. This initiative
                        honors his spirit by nurturing the next generation of curious minds.
                    </motion.p>

                    <motion.div
                        className="flex items-center justify-center gap-2 mt-8 text-[#FF9F43]"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <Heart className="w-5 h-5 fill-current" />
                        <span className="font-semibold text-[#0B2545]">Math is not just a subject. It's a life skill.</span>
                    </motion.div>

                    {/* Video Grid */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        {[
                            { title: "Launch of Math Skill Builder", link: "https://youtu.be/BnYiNL81S-s?si=1Xkp-Vm9xWFdQJ4w" },
                            { title: "International Day of Mathematics", link: "https://youtu.be/L7N1qvWvfr4?si=Uvy6HB9F6fvoYeJv" },
                            { title: "World Youth Skills Day", link: "https://youtu.be/xGqJyf-2_zM?si=Z6ImXCWi33CmDwH3" },
                            { title: "National Mathematics Day | Parent Feedback", link: "https://youtu.be/emvYAmEucto?si=x1_RVTGH2IyCSwP6" },
                            { title: "National Mathematics Day | Student Feedback", link: "https://www.youtube.com/shorts/cyCV-yt42TA" },
                            { title: "National Mathematics Day | Parent Feedback", link: "https://www.youtube.com/shorts/lWUhVm7Yukk" },
                        ].map((video, index) => {
                            const videoId = getVideoId(video.link);
                            const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

                            return (
                                <div
                                    key={index}
                                    onClick={() => setSelectedVideo(videoId)}
                                    className="group cursor-pointer"
                                >
                                    <div className={`aspect-video rounded-2xl bg-gray-100 relative overflow-hidden mb-3 shadow-sm border border-black/5 flex items-center justify-center group-hover:shadow-md transition-all`}>
                                        <Image
                                            src={thumbnail}
                                            alt={video.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform relative z-10">
                                            <Play className="w-5 h-5 text-[#0B2545] fill-current ml-1" />
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-[#0B2545] text-sm group-hover:text-[#007AFF] transition-colors line-clamp-2">
                                        {video.title}
                                    </h3>
                                </div>
                            );
                        })}
                    </motion.div>
                </motion.div>
            </div>

            {/* Video Modal */}
            <AnimatePresence>
                {selectedVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setSelectedVideo(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-black w-full max-w-6xl aspect-video rounded-2xl overflow-hidden relative shadow-2xl"
                            style={{ width: '90%', height: 'auto', maxHeight: '80vh' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <iframe
                                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&rel=0`}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default ContextSection;
