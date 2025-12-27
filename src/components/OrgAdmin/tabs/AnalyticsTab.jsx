"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { TrendingUp, Users, Award, Clock } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AnalyticsTab({ orgId, orgData }) {
    const [timeRange, setTimeRange] = useState('7days');
    const [analyticsData, setAnalyticsData] = useState(null);

    useEffect(() => {
        loadAnalytics();
    }, [orgId, timeRange]);

    const loadAnalytics = async () => {
        try {
            // TODO: Fetch analytics from Firebase
            // Mock data for now
            setAnalyticsData({
                overview: {
                    totalTests: 245,
                    averageScore: 78,
                    activeStudents: 156,
                    completionRate: 85,
                },
                dailyActivity: [
                    { date: 'Mon', tests: 35, students: 28 },
                    { date: 'Tue', tests: 42, students: 35 },
                    { date: 'Wed', tests: 38, students: 30 },
                    { date: 'Thu', tests: 45, students: 38 },
                    { date: 'Fri', tests: 50, students: 42 },
                    { date: 'Sat', tests: 20, students: 15 },
                    { date: 'Sun', tests: 15, students: 12 },
                ],
                gradePerformance: [
                    { grade: 'Grade 6', average: 75 },
                    { grade: 'Grade 7', average: 78 },
                    { grade: 'Grade 8', average: 82 },
                    { grade: 'Grade 9', average: 80 },
                    { grade: 'Grade 10', average: 85 },
                ],
            });
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    };

    if (!analyticsData) {
        return (
            <div style={{ padding: '24px', textAlign: 'center' }}>
                <p>Loading analytics...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
            }}>
                <div>
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>
                        Analytics & Reports
                    </h2>
                    <p style={{ margin: 0, color: '#6B7280' }}>
                        Track performance and engagement across your organization
                    </p>
                </div>

                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Time Range</InputLabel>
                    <Select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        label="Time Range"
                    >
                        <MenuItem value="7days">Last 7 Days</MenuItem>
                        <MenuItem value="30days">Last 30 Days</MenuItem>
                        <MenuItem value="90days">Last 90 Days</MenuItem>
                        <MenuItem value="year">This Year</MenuItem>
                    </Select>
                </FormControl>
            </div>

            {/* Overview Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '32px'
            }}>
                <MetricCard
                    icon={<TrendingUp size={20} />}
                    title="Total Tests"
                    value={analyticsData.overview.totalTests}
                    change="+12%"
                    positive={true}
                />
                <MetricCard
                    icon={<Award size={20} />}
                    title="Average Score"
                    value={`${analyticsData.overview.averageScore}%`}
                    change="+5%"
                    positive={true}
                />
                <MetricCard
                    icon={<Users size={20} />}
                    title="Active Students"
                    value={analyticsData.overview.activeStudents}
                    change="+8%"
                    positive={true}
                />
                <MetricCard
                    icon={<Clock size={20} />}
                    title="Completion Rate"
                    value={`${analyticsData.overview.completionRate}%`}
                    change="-2%"
                    positive={false}
                />
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Daily Activity Chart */}
                <Card>
                    <CardContent>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
                            Daily Activity
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={analyticsData.dailyActivity}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="tests" stroke="#3B82F6" name="Tests Completed" />
                                <Line type="monotone" dataKey="students" stroke="#10B981" name="Active Students" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Grade Performance Chart */}
                <Card>
                    <CardContent>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
                            Performance by Grade
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analyticsData.gradePerformance}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="grade" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="average" fill="#8B5CF6" name="Average Score %" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Metric Card Component
function MetricCard({ icon, title, value, change, positive }) {
    return (
        <Card>
            <CardContent>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div style={{
                        padding: '8px',
                        background: '#F3F4F6',
                        borderRadius: '8px',
                        color: '#6B7280'
                    }}>
                        {icon}
                    </div>
                    <span style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: positive ? '#10B981' : '#EF4444'
                    }}>
                        {change}
                    </span>
                </div>
                <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#6B7280' }}>
                    {title}
                </p>
                <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
                    {value}
                </h3>
            </CardContent>
        </Card>
    );
}
