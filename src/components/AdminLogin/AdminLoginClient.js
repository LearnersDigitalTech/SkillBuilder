'use client'

import { useActionState } from 'react'
import { loginAdmin } from '../../app/actions/auth'
import { TextField, Button, Card, CardContent, Typography, Alert, Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import Header from "@/app/homepage/Header";

const PageContainer = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
})

const LoginContainer = styled('div')({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    padding: '20px',
})

const LoginCard = styled(Card)({
    maxWidth: 400,
    width: '100%',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    backdropFilter: 'blur(4px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
})

const Form = styled('form')({
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    marginTop: '24px',
})

const StyledButton = styled(Button)({
    backgroundColor: '#3c91f3',
    padding: '12px',
    fontSize: '1rem',
    fontWeight: 600,
    textTransform: 'none',
    '&:hover': {
        backgroundColor: '#1a73e8',
    },
})

export default function AdminLoginClient() {
    const [state, formAction, isPending] = useActionState(loginAdmin, null)

    return (
        <PageContainer>
            <Header />
            <LoginContainer>
                <LoginCard elevation={0}>
                    <CardContent>
                        <Box sx={{ mb: 3, textAlign: 'center' }}>
                            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#333' }}>
                                Admin Login
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Welcome back! Please enter your details.
                            </Typography>
                        </Box>

                        {state?.message && (
                            <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
                                {state.message}
                            </Alert>
                        )}

                        <Form action={formAction}>
                            <TextField
                                label="Username"
                                name="username"
                                required
                                fullWidth
                                variant="outlined"
                                InputProps={{
                                    sx: { borderRadius: '8px' }
                                }}
                            />
                            <TextField
                                label="Password"
                                name="password"
                                type="password"
                                required
                                fullWidth
                                variant="outlined"
                                InputProps={{
                                    sx: { borderRadius: '8px' }
                                }}
                            />
                            <StyledButton
                                type="submit"
                                variant="contained"
                                fullWidth
                                disabled={isPending}
                                disableElevation
                            >
                                {isPending ? 'Logging in...' : 'Login'}
                            </StyledButton>
                        </Form>
                    </CardContent>
                </LoginCard>
            </LoginContainer>
        </PageContainer>
    )
}
