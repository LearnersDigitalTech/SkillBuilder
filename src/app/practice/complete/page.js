"use client";
import React from "react";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { Award, RefreshCcw, Home } from "lucide-react";

export default function PracticeCompletePage() {
    const router = useRouter();

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "2rem",
            background: "#f8fafc",
            textAlign: "center",
            padding: "2rem"
        }}>
            <Award size={80} color="#f59e0b" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h1 style={{ fontSize: "2rem", color: "#1e293b", margin: 0 }}>Great Job!</h1>
                <p style={{ color: "#64748b", fontSize: "1.125rem", margin: 0 }}>You have completed the practice session.</p>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
                <Button
                    variant="outlined"
                    startIcon={<Home />}
                    onClick={() => router.push('/')}
                    sx={{ textTransform: "none", fontSize: "1rem" }}
                >
                    Home
                </Button>
                <Button
                    variant="contained"
                    startIcon={<RefreshCcw />}
                    onClick={() => router.push('/practice')}
                    sx={{ textTransform: "none", fontSize: "1rem", backgroundColor: "#2563eb" }}
                >
                    Practice Again
                </Button>
            </div>
        </div>
    );
}
