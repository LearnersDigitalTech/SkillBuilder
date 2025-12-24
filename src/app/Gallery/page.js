'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Only real photo gallery albums (excluding special pages like Skill-Builder-Launch)
const albums = [
    {
        id: 'math-camp-2024',
        title: 'Summer Math Camp 2024',
        date: 'July 15, 2024',
        color: 'from-blue-500 to-cyan-500',
    }
];

export default function GalleryPage() {
    return (
        <div className="min-h-screen bg-background text-foreground py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                    >
                        Event Gallery
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-muted-foreground"
                    >
                        Explore moments from our latest events, workshops, and gatherings.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {albums.map((album, index) => (
                        <motion.div
                            key={album.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -8, transition: { duration: 0.2 } }}
                            className="group cursor-pointer"
                        >
                            <Link href={`/Gallery/${album.id}`} className="block h-full">
                                <div className="relative overflow-hidden rounded-2xl shadow-lg border border-border bg-card h-full flex flex-col">
                                    {/* Album Cover Placeholder */}
                                    <div className={`h-48 w-full bg-gradient-to-br ${album.color} relative overflow-visible group-hover:scale-105 transition-transform duration-500`}>
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />

                                        {/* Decorative patterns */}
                                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                                        <div className="absolute top-4 left-4 w-16 h-16 bg-white/20 rounded-full blur-xl" />
                                    </div>

                                    <div className="p-6 flex-grow flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{album.title}</h3>
                                            <p className="text-sm text-muted-foreground">{album.date}</p>
                                        </div>
                                        <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                                            View Album
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
