import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle, IconButton, TextField, Button, Select, MenuItem, FormControl } from '@mui/material';
import { X, User, GraduationCap, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/stores/authStore';
import Styles from './AuthModal.module.css';

interface AuthModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    redirectPath?: string;
}

type Step = 'CHOOSE_METHOD' | 'REGISTER' | 'SELECT_PROFILE';

export default function AuthModal({ open, onClose, onSuccess, redirectPath }: AuthModalProps) {
    const [step, setStep] = useState<Step>('CHOOSE_METHOD');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, register, user } = useAuthStore();

    // Login state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Register state
    const [registrationData, setRegistrationData] = useState({
        name: '',
        grade: ''
    });

    const handleEmailSignIn = async () => {
        if (!email || !password) {
            toast.error('Please enter both User ID and password');
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
            toast.success('Login successful!');
            onSuccess?.();
            onClose();

            if (redirectPath) {
                navigate(redirectPath);
            } else {
                navigate('/dashboard');
            }
        } catch (error: any) {
            toast.error('Login failed. Check your User ID and password.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterStart = async () => {
        if (!registrationData.grade) {
            toast.error('Please select a grade to continue');
            return;
        }

        setLoading(true);
        try {
            await register({
                email,
                password,
                childName: registrationData.name || 'Student 1',
                grade: registrationData.grade,
                school: ''
            });

            toast.success('Registration Successful!');
            onSuccess?.();
            onClose();
            navigate('/dashboard');
        } catch (error: any) {
            toast.error('Failed to start assessment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setRegistrationData({ name: '', grade: '' });
        setStep('CHOOSE_METHOD');
    };

    return (
        <Dialog
            open={open}
            onClose={() => {
                onClose();
                resetForm();
            }}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                className: Styles.modalPaper
            }}
        >
            <DialogTitle className={Styles.modalHeader}>
                <div className={Styles.headerContent}>
                    {step === 'CHOOSE_METHOD' && 'Sign In'}
                    {step === 'SELECT_PROFILE' && 'Select Profile'}
                    {step === 'REGISTER' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <GraduationCap size={28} className={Styles.headerIcon} />
                            <span>Select Your Grade</span>
                        </div>
                    )}
                </div>
                <IconButton onClick={onClose} className={Styles.closeButton}>
                    <X size={20} />
                </IconButton>
            </DialogTitle>

            <DialogContent className={Styles.modalContent}>
                {/* ==================== CHOOSE METHOD ==================== */}
                {step === 'CHOOSE_METHOD' && (
                    <div className={Styles.stepContainer}>
                        {/* Email/Password Login */}
                        <div className={Styles.emailLoginContainer}>
                            <TextField
                                label="User ID"
                                placeholder="e.g. S1001"
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                size="medium"
                                fullWidth
                                margin="dense"
                                className={Styles.textField}
                            />
                            <TextField
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                size="medium"
                                fullWidth
                                margin="dense"
                                className={Styles.textField}
                            />
                            <Button
                                onClick={handleEmailSignIn}
                                className={Styles.actionButton}
                                fullWidth
                                disabled={loading}
                            >
                                Sign In
                            </Button>
                        </div>

                        {/* OR Divider */}
                        <div className={Styles.divider}>
                            <span>OR</span>
                        </div>

                        <Button
                            onClick={() => setStep('REGISTER')}
                            className={Styles.googleButton}
                            disabled={loading}
                        >
                            Create New Account
                        </Button>
                    </div>
                )}

                {/* ==================== REGISTER (Complete Profile) ==================== */}
                {step === 'REGISTER' && (
                    <div className={Styles.stepContainer}>
                        <form className={Styles.formGrid}>
                            <div className={Styles.inputGroup}>
                                <User className={Styles.inputIcon} size={20} />
                                <TextField
                                    fullWidth
                                    placeholder="Enter student name"
                                    variant="outlined"
                                    value={registrationData.name}
                                    onChange={(e) => setRegistrationData({ ...registrationData, name: e.target.value })}
                                    className={Styles.textField}
                                    autoFocus
                                />
                            </div>

                            <div className={Styles.gradeSection}>
                                <FormControl fullWidth variant="outlined" className={Styles.gradeSelect}>
                                    <Select
                                        value={registrationData.grade}
                                        displayEmpty
                                        onChange={(e) => setRegistrationData({ ...registrationData, grade: e.target.value })}
                                        renderValue={(selected) => {
                                            if (!selected) {
                                                return <span style={{ color: '#9ca3af' }}>Grade</span>;
                                            }
                                            return selected;
                                        }}
                                    >
                                        <MenuItem disabled value="">
                                            <em>Grade</em>
                                        </MenuItem>
                                        {[...Array(12)].map((_, i) => (
                                            <MenuItem key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>
                        </form>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleRegisterStart}
                            disabled={loading}
                            className={Styles.actionButton}
                        >
                            {loading ? 'Loading...' : 'Start Assessment →'}
                        </Button>
                        <Button
                            onClick={() => setStep('CHOOSE_METHOD')}
                            className={Styles.backButton}
                            disabled={loading}
                        >
                            Back to Sign In Options
                        </Button>
                    </div>
                )}

                {/* ==================== SELECT PROFILE STEP ==================== */}
                {step === 'SELECT_PROFILE' && user?.children && (
                    <div className={Styles.stepContainer}>
                        <p className={Styles.stepDescription}>Select who is taking the test</p>

                        <div className={Styles.profileList}>
                            {/* Add New Student Item */}
                            <div
                                className={`${Styles.profileListItem} ${Styles.addProfileItem}`}
                                onClick={() => setStep('REGISTER')}
                            >
                                <div className={Styles.profileListAvatar}>
                                    <Plus size={18} />
                                </div>
                                <div className={Styles.profileListInfo}>
                                    <div className={Styles.profileListName}>Add Student</div>
                                </div>
                            </div>

                            {user.children.map((child: any, index: number) => (
                                <div
                                    key={index}
                                    className={Styles.profileListItem}
                                    onClick={() => {
                                        toast.success(`Welcome ${child.name}!`);
                                        onClose();
                                        navigate('/dashboard');
                                    }}
                                >
                                    <div className={Styles.profileListAvatar}>
                                        {child.name ? child.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div className={Styles.profileListInfo}>
                                        <div className={Styles.profileListName}>{child.name}</div>
                                        <div className={Styles.profileListGrade}>{child.grade}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button
                            onClick={() => setStep('CHOOSE_METHOD')}
                            className={Styles.backButton}
                            disabled={loading}
                        >
                            Sign in with different account
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
