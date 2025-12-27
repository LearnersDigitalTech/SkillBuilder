"use client";

import React, { useEffect, useState } from "react";
import Header from "@/app/homepage/Header";
import Footer from "@/components/Footer/Footer.component";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { firebaseDatabase } from "@/backend/firebaseHandler";
import { ref, get } from "firebase/database";
import { CircularProgress, Table, TableHead, TableRow, TableBody, TableCell, Paper, Typography } from "@mui/material";
import Styles from "../../app/tutor-bookings/TutorBookings.module.css";

const TutorBookingsClient = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        if (!user) {
            router.replace("/");
        }
    }, [user, router]);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user?.phoneNumber) {
                setLoading(false);
                return;
            }

            try {
                const phoneKey = user.phoneNumber.slice(-10);
                const bookingsRef = ref(firebaseDatabase, `NMD_2025/TutorBookings/${phoneKey}`);
                const snapshot = await get(bookingsRef);
                if (!snapshot.exists()) {
                    setBookings([]);
                    return;
                }

                const data = snapshot.val() || {};
                const entries = Object.entries(data).map(([id, value]) => ({ id, ...value }));
                entries.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                setBookings(entries);
            } catch (error) {
                console.error("Error fetching tutor bookings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user]);

    return (
        <div className={Styles.pageWrapper}>
            <Header />

            <main className={Styles.contentWrapper}>
                <header className={Styles.header}>
                    <Typography variant="h5" className={Styles.title}>
                        Tutor Bookings
                    </Typography>
                    <Typography variant="body2" className={Styles.subtitle}>
                        Review all learning session requests raised from this account.
                    </Typography>
                </header>

                {loading ? (
                    <div className={Styles.loadingWrapper}>
                        <CircularProgress />
                    </div>
                ) : bookings.length === 0 ? (
                    <Paper className={Styles.emptyState}>
                        <Typography variant="body1">No tutor bookings found yet.</Typography>
                        <Typography variant="body2" className={Styles.emptyHint}>
                            Complete a test and use the "Learn with Tutor" button on the report page to raise a request.
                        </Typography>
                    </Paper>
                ) : (
                    <Paper className={Styles.tableCard}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Student</TableCell>
                                    <TableCell>Grade</TableCell>
                                    <TableCell>Time Slot</TableCell>
                                    <TableCell>Mode</TableCell>
                                    <TableCell>Contact</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bookings.map((b) => (
                                    <TableRow key={b.id}>
                                        <TableCell>{b.preferredDate}</TableCell>
                                        <TableCell>{b.studentName}</TableCell>
                                        <TableCell>{b.grade}</TableCell>
                                        <TableCell>{b.preferredTimeSlot}</TableCell>
                                        <TableCell>{b.mode}</TableCell>
                                        <TableCell>{b.phone}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default TutorBookingsClient;
