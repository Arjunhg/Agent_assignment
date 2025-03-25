import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import {
    TextField,
    Button,
    Container,
    Box,
    Typography,
    Paper,
    Alert,
    CircularProgress,
    createTheme,
    ThemeProvider
} from "@mui/material";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Custom theme based on the color usage plan
const theme = createTheme({
    palette: {
        primary: {
            main: '#c05e3c',
        },
        secondary: {
            main: '#f8f0ed',
        },
        text: {
            primary: '#333333',
        },
        success: {
            main: '#4caf50',
        },
        warning: {
            main: '#ff9800',
        },
        background: {
            default: '#ffffff',
            paper: '#f8f0ed',
        },
    },
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: '#e0e0e0',
                        },
                        '&:hover fieldset': {
                            borderColor: '#c05e3c',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#c05e3c',
                        },
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    borderRadius: 4,
                    textTransform: 'none',
                },
            },
        },
    },
});

const Register = () => {
    const { control, handleSubmit, formState: { errors } } = useForm();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("error");

    const onSubmit = async (data) => {
        setLoading(true);
        setMessage("");

        try {
            const response = await axios.post(`${BACKEND_URL}/api/auth/register`, data);

            if (response.data.success) {
                // Store user data and token in localStorage
                login(response.data); // This will store the token and user data
                setMessage("Registration successful! Redirecting to dashboard...");
                setMessageType("success");
                setTimeout(() => navigate("/dashboard"), 1500); // Redirect to dashboard instead of login
            } else {
                setMessage(response.data.message || "Registration failed.");
                setMessageType("error");
            }
        } catch (error) {
            console.error(error);
            setMessage(error.response?.data?.message || "Error registering user.");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    bgcolor: '#ffffff',
                    py: 4
                }}
            >
                <Container maxWidth="sm">
                    <Paper
                        elevation={2}
                        sx={{
                            p: 4,
                            borderRadius: 2,
                            bgcolor: '#f8f0ed',
                            border: '1px solid #e0e0e0'
                        }}
                    >
                        <Typography
                            variant="h4"
                            component="h1"
                            align="center"
                            gutterBottom
                            fontWeight="bold"
                            color="#333333"
                        >
                            Register
                        </Typography>

                        {message && (
                            <Alert
                                severity={messageType}
                                sx={{ mb: 2 }}
                            >
                                {message}
                            </Alert>
                        )}

                        <Box
                            component="form"
                            onSubmit={handleSubmit(onSubmit)}
                            noValidate
                            sx={{ mt: 1 }}
                        >
                            <Controller
                                name="name"
                                control={control}
                                defaultValue=""
                                rules={{ required: "Name is required" }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="name"
                                        label="Full Name"
                                        autoFocus
                                        error={!!errors.name}
                                        helperText={errors.name ? errors.name.message : ''}
                                        variant="outlined"
                                        InputLabelProps={{
                                            style: { color: '#333333' },
                                        }}
                                        sx={{
                                            bgcolor: '#ffffff',
                                            borderRadius: 1,
                                        }}
                                    />
                                )}
                            />

                            <Controller
                                name="email"
                                control={control}
                                defaultValue=""
                                rules={{ required: "Email is required" }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="email"
                                        label="Email Address"
                                        autoComplete="email"
                                        error={!!errors.email}
                                        helperText={errors.email ? errors.email.message : ''}
                                        variant="outlined"
                                        InputLabelProps={{
                                            style: { color: '#333333' },
                                        }}
                                        sx={{
                                            bgcolor: '#ffffff',
                                            borderRadius: 1,
                                        }}
                                    />
                                )}
                            />

                            <Controller
                                name="password"
                                control={control}
                                defaultValue=""
                                rules={{
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters"
                                    }
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="password"
                                        label="Password"
                                        type="password"
                                        autoComplete="new-password"
                                        error={!!errors.password}
                                        helperText={errors.password ? errors.password.message : ''}
                                        variant="outlined"
                                        InputLabelProps={{
                                            style: { color: '#333333' },
                                        }}
                                        sx={{
                                            bgcolor: '#ffffff',
                                            borderRadius: 1,
                                        }}
                                    />
                                )}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={loading}
                                sx={{
                                    mt: 3,
                                    mb: 2,
                                    py: 1.5,
                                    bgcolor: '#c05e3c',
                                    '&:hover': {
                                        bgcolor: '#a94e33',
                                    },
                                    '&.Mui-disabled': {
                                        bgcolor: '#e0e0e0',
                                        color: '#999999'
                                    }
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Register"}
                            </Button>
                        </Box>
                    </Paper>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default Register;