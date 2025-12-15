'use client';
import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';


export const MarksBarChart = ({ data }) => (
    <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
        <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
                Average Marks by Grade
            </Typography>
            <Box sx={{ height: 300, width: '100%', minHeight: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} angle={-30} textAnchor="end" interval={0} height={60} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}
                            itemStyle={{ color: '#000' }}
                        />
                        <Bar dataKey="avg" fill="#4caf50" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </CardContent>
    </Card>
);

export const StudentsAreaChart = ({ data, filter, onFilterChange }) => (
    <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
        <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                    Student Growth Trend
                </Typography>
                <select
                    value={filter}
                    onChange={(e) => onFilterChange(e.target.value)}
                    style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #e0e0e0',
                        fontSize: '14px',
                        outline: 'none'
                    }}
                >
                    <option value="day">Day</option>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                </select>
            </Box>
            <Box sx={{ height: 300, width: '100%', minHeight: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2196f3" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#2196f3" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip
                            cursor={{ stroke: '#ccc' }}
                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}
                            itemStyle={{ color: '#000' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="students"
                            stroke="#2196f3"
                            fillOpacity={1}
                            fill="url(#colorStudents)"
                            strokeWidth={3}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Box>
        </CardContent>
    </Card>
);
