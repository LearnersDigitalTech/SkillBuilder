/**
 * Admin Dashboard Page
 * User management, statistics, and system administration
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Users, BarChart3, Settings, LogOut, Search,
    UserPlus, Shield, GraduationCap, Trophy,
    ChevronDown, Filter, MoreVertical
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { adminApi } from '@/api/client'
import { Header, Footer } from '@/components/Layout'
import toast from 'react-hot-toast'
import styles from './AdminDashboard.module.css'

export default function AdminDashboard() {
    const navigate = useNavigate()
    const { user, userData, logout } = useAuth()

    const [activeTab, setActiveTab] = useState('overview')
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalQuizzes: 0,
        activeToday: 0
    })
    const [users, setUsers] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRole, setFilterRole] = useState('all')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, usersRes] = await Promise.all([
                    adminApi.getStats(),
                    adminApi.getUsers()
                ])
                setStats(statsRes.data)
                setUsers(usersRes.data || [])
            } catch (error) {
                console.error('Error fetching admin data:', error)
                toast.error('Failed to load admin data')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    // Filter users
    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = filterRole === 'all' || u.user_type === filterRole
        return matchesSearch && matchesRole
    })

    return (
        <div className={styles.page}>
            <Header />

            <div className={styles.container}>
                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>
                        <Shield size={24} className={styles.adminIcon} />
                        <div>
                            <h3>Admin Panel</h3>
                            <p>{userData?.name || 'Administrator'}</p>
                        </div>
                    </div>

                    <nav className={styles.sidebarNav}>
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`}
                        >
                            <BarChart3 size={20} />
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`${styles.navItem} ${activeTab === 'users' ? styles.active : ''}`}
                        >
                            <Users size={20} />
                            Users
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`}
                        >
                            <Settings size={20} />
                            Settings
                        </button>
                    </nav>

                    <button onClick={handleLogout} className={styles.logoutButton}>
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </aside>

                {/* Main Content */}
                <main className={styles.main}>
                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner} />
                        </div>
                    ) : (
                        <>
                            {activeTab === 'overview' && (
                                <div className={styles.overview}>
                                    <h1 className={styles.pageTitle}>Dashboard Overview</h1>

                                    {/* Stats Grid */}
                                    <div className={styles.statsGrid}>
                                        <div className={styles.statCard}>
                                            <div className={`${styles.statIcon} ${styles.blue}`}>
                                                <Users size={24} />
                                            </div>
                                            <div className={styles.statInfo}>
                                                <span className={styles.statValue}>{stats.totalUsers}</span>
                                                <span className={styles.statLabel}>Total Users</span>
                                            </div>
                                        </div>
                                        <div className={styles.statCard}>
                                            <div className={`${styles.statIcon} ${styles.green}`}>
                                                <GraduationCap size={24} />
                                            </div>
                                            <div className={styles.statInfo}>
                                                <span className={styles.statValue}>{stats.totalStudents}</span>
                                                <span className={styles.statLabel}>Students</span>
                                            </div>
                                        </div>
                                        <div className={styles.statCard}>
                                            <div className={`${styles.statIcon} ${styles.purple}`}>
                                                <Shield size={24} />
                                            </div>
                                            <div className={styles.statInfo}>
                                                <span className={styles.statValue}>{stats.totalTeachers}</span>
                                                <span className={styles.statLabel}>Teachers</span>
                                            </div>
                                        </div>
                                        <div className={styles.statCard}>
                                            <div className={`${styles.statIcon} ${styles.orange}`}>
                                                <Trophy size={24} />
                                            </div>
                                            <div className={styles.statInfo}>
                                                <span className={styles.statValue}>{stats.totalQuizzes}</span>
                                                <span className={styles.statLabel}>Quizzes Taken</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Activity */}
                                    <div className={styles.recentSection}>
                                        <h2>Recent Activity</h2>
                                        <p className={styles.emptyText}>Activity feed coming soon...</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'users' && (
                                <div className={styles.usersSection}>
                                    <div className={styles.usersHeader}>
                                        <h1 className={styles.pageTitle}>User Management</h1>
                                        <button className={styles.addUserButton}>
                                            <UserPlus size={18} />
                                            Add User
                                        </button>
                                    </div>

                                    {/* Filters */}
                                    <div className={styles.filters}>
                                        <div className={styles.searchWrapper}>
                                            <Search size={18} className={styles.searchIcon} />
                                            <input
                                                type="text"
                                                placeholder="Search users..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className={styles.searchInput}
                                            />
                                        </div>
                                        <select
                                            value={filterRole}
                                            onChange={(e) => setFilterRole(e.target.value)}
                                            className={styles.filterSelect}
                                        >
                                            <option value="all">All Roles</option>
                                            <option value="student">Students</option>
                                            <option value="teacher">Teachers</option>
                                            <option value="admin">Admins</option>
                                        </select>
                                    </div>

                                    {/* Users Table */}
                                    <div className={styles.table}>
                                        <div className={styles.tableHeader}>
                                            <span>User</span>
                                            <span>Role</span>
                                            <span>Joined</span>
                                            <span></span>
                                        </div>
                                        {filteredUsers.length === 0 ? (
                                            <div className={styles.emptyRow}>
                                                <p>No users found</p>
                                            </div>
                                        ) : (
                                            filteredUsers.map((u) => (
                                                <div key={u.id} className={styles.tableRow}>
                                                    <div className={styles.userCell}>
                                                        <div className={styles.userAvatar}>
                                                            {u.name?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                        <div>
                                                            <span className={styles.userName}>{u.name}</span>
                                                            <span className={styles.userEmail}>{u.email}</span>
                                                        </div>
                                                    </div>
                                                    <span className={styles.roleChip}>{u.user_type}</span>
                                                    <span className={styles.dateText}>
                                                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                                                    </span>
                                                    <button className={styles.moreButton}>
                                                        <MoreVertical size={18} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className={styles.settingsSection}>
                                    <h1 className={styles.pageTitle}>Settings</h1>
                                    <p className={styles.emptyText}>Settings page coming soon...</p>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            <Footer />
        </div>
    )
}
