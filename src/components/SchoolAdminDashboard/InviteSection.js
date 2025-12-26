
'use client';

import { Send, Users, Share2, Heart, UserPlus, BookOpen } from 'lucide-react';

export default function InviteSection() {
    return (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 text-white shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Grow Your Community</h2>
                    <p className="text-indigo-100 opacity-90">Invite stakeholders to join the specific roles and support learners.</p>
                </div>

                <div className="flex flex-wrap gap-4 justify-center md:justify-end">
                    {/* Teacher Guide & Connectors */}
                    <button className="flex items-center gap-2 px-4 py-3 bg-white text-indigo-700 rounded-xl font-bold hover:bg-indigo-50 hover:scale-105 transition-all shadow-sm text-sm">
                        <Users size={16} />
                        Teacher Guides
                    </button>

                    {/* Parents & Supporters */}
                    <button className="flex items-center gap-2 px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl font-bold hover:bg-white/30 transition-all text-sm">
                        <Heart size={16} />
                        Parent Supporters
                    </button>

                    {/* Math Companions */}
                    <button className="flex items-center gap-2 px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl font-bold hover:bg-white/30 transition-all text-sm">
                        <UserPlus size={16} />
                        Math Companions
                    </button>

                    {/* General Link */}
                    <button className="flex items-center gap-2 px-4 py-3 bg-indigo-800 text-white rounded-xl font-bold hover:bg-indigo-900 transition-all text-sm border border-indigo-400">
                        <Share2 size={16} />
                        Share School Link
                    </button>
                </div>
            </div>
            <p className="text-xs text-indigo-200 mt-4 text-center md:text-left opacity-75">
                All invited users will be automatically linked to this School ID.
            </p>
        </div>
    );
}
