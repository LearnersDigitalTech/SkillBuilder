"use client";
import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, Button, CircularProgress } from "@mui/material";
import { Phone } from "lucide-react";
import { ref, set } from "firebase/database";
import { firebaseDatabase, getUserDatabaseKey } from "@/backend/firebaseHandler";
import Styles from "./PhoneNumberDialog.module.css";

export default function PhoneNumberDialog({ open, user, onComplete }) {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (phoneNumber.length !== 10) {
            setError("Please enter a valid 10-digit phone number");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Get user database key consistently
            const userKey = getUserDatabaseKey(user);
            // Save phone number to user's registration data (correct location)
            const phoneRef = ref(firebaseDatabase, `NMD_2025/Registrations/${userKey}/phoneNumber`);
            await set(phoneRef, phoneNumber);

            // Call completion callback
            onComplete(phoneNumber);
        } catch (err) {
            console.error("Error saving phone number:", err);
            setError("Failed to save phone number. Please try again.");
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            disableEscapeKeyDown
            maxWidth="sm"
            fullWidth
            PaperProps={{
                className: Styles.dialogPaper
            }}
        >
            <DialogTitle className={Styles.dialogTitle}>
                <Phone size={24} className={Styles.icon} />
                Complete Your Profile
            </DialogTitle>
            <DialogContent className={Styles.dialogContent}>
                <p className={Styles.description}>
                    Please provide your phone number to continue. This helps us contact you for tutor bookings and important updates.
                </p>

                <form onSubmit={handleSubmit} className={Styles.form}>
                    <div className={Styles.inputGroup}>
                        <Phone className={Styles.inputIcon} size={20} />
                        <TextField
                            fullWidth
                            label="Phone Number"
                            variant="outlined"
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            InputProps={{
                                startAdornment: <span className={Styles.prefix}>+91</span>,
                            }}
                            error={!!error}
                            helperText={error || "10-digit Indian mobile number"}
                            disabled={loading}
                            className={Styles.textField}
                            autoFocus
                        />
                    </div>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading || phoneNumber.length !== 10}
                        className={Styles.submitButton}
                    >
                        {loading ? (
                            <>
                                <CircularProgress size={20} color="inherit" style={{ marginRight: 8 }} />
                                Saving...
                            </>
                        ) : (
                            "Continue to Dashboard"
                        )}
                    </Button>
                </form>

                <p className={Styles.note}>
                    <strong>Note:</strong> This is a one-time setup. Your phone number will be used for communication purposes only.
                </p>
            </DialogContent>
        </Dialog>
    );
}
