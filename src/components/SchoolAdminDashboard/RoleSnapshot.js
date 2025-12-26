
'use client';

import { ROLES } from '../../utils/permissions';

export default function RoleSnapshot() {
    // Conceptual mock data - in real app, these would come from Firestore
    const roleStats = [
        { id: ROLES.MATH_CONNECTOR, name: "Math Connectors", active: 15, desc: "Introduced learners", color: "bg-blue-100 text-blue-700" },
        { id: ROLES.MATH_COMPANION, name: "Math Companions", active: 18, desc: "Supported learners", color: "bg-indigo-100 text-indigo-700" },
        { id: ROLES.PARENT_SUPPORTER, name: "Parent Supporters", active: 24, desc: "30-minute engagement", color: "bg-purple-100 text-purple-700" },
        { id: ROLES.TEACHER_GUIDE, name: "Teacher Guides", active: 5, desc: "Pedagogical guidance", color: "bg-teal-100 text-teal-700" },
        { id: ROLES.MATH_MENTOR, name: "Math Mentors", active: 4, desc: "Academic guidance", color: "bg-pink-100 text-pink-700" },
        { id: ROLES.MATH_CHAMPION, name: "Math Champions", active: 2, desc: "Community advocates", color: "bg-yellow-100 text-yellow-700" },
    ];

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Role Participation Snapshot</h3>

            <div className="space-y-4">
                {roleStats.map((role, index) => (
                    <div key={index} className="flex items-center justify-between group p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="flex items-center space-x-4">
                            <span className={`flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${role.color}`}>
                                {role.active}
                            </span>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">{role.name}</p>
                                <p className="text-xs text-gray-500">{role.desc}</p>
                            </div>
                        </div>
                        <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${role.color.replace('text', 'bg').split(' ')[0]} rounded-full`} style={{ width: `${Math.random() * 60 + 20}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-50 text-center text-xs text-gray-400">
                Participation linked to School ID.
            </div>
        </div>
    );
}
