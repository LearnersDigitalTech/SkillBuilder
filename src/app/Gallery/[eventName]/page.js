'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';

// Mock data generator for individual event images
const getEventImages = (eventId) => {
    // Generate different "color" themes or placeholders based on ID for variety
    const baseColors = [
        'bg-blue-100 dark:bg-blue-900/20',
        'bg-purple-100 dark:bg-purple-900/20',
        'bg-emerald-100 dark:bg-emerald-900/20',
        'bg-amber-100 dark:bg-amber-900/20',
        'bg-rose-100 dark:bg-rose-900/20',
    ];

    // Create an array of 12 mock images
    return Array.from({ length: 12 }, (_, i) => ({
        id: i,
        // Randomize aspect ratio for "masonry" feel in grid
        aspect: i % 3 === 0 ? 'aspect-video' : i % 3 === 1 ? 'aspect-square' : 'aspect-[4/5]',
        color: baseColors[i % baseColors.length],
        title: `Photo ${i + 1}`
    }));
};

export default function EventGalleryPage() {
    const params = useParams();
    const rawEventName = params.eventName || '';
    const eventName = typeof rawEventName === 'string'
        ? rawEventName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        : 'Event Gallery';

    const images = getEventImages(rawEventName);

    return (
        <div className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Navigation */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
                    <div>
                        <Link
                            href="/Gallery"
                            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Albums
                        </Link>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-3xl md:text-4xl font-bold"
                        >
                            {eventName}
                        </motion.h1>
                    </div>

                    <div className="mt-4 md:mt-0">
                        <span className="px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                            {images.length} Items
                        </span>
                    </div>
                </div>

                {/* Gallery Grid */}
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                    {images.map((img, index) => (
                        <motion.div
                            key={img.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="break-inside-avoid"
                        >
                            <div className={`relative rounded-xl overflow-hidden group ${img.color}`}>
                                {/* Image Placeholder - In real app, this would be an <img /> or <Image /> */}
                                <div className={`w-full ${img.aspect} flex items-center justify-center`}>
                                    <span className="text-muted-foreground/30 font-medium text-lg">
                                        {img.title}
                                    </span>
                                </div>

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full p-2 hover:bg-white/20 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
