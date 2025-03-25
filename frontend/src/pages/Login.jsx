import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import axios from "axios";
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

const Login = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { data } = await axios.post(`${BACKEND_URL}/api/auth/login`, { email, password });

            if (data.success) {
                login(data);
                navigate("/dashboard");
            } else {
                setError(data.message || "Invalid email or password");
            }
        } catch (error) {
            setError(error.response?.data?.message || "Something went wrong. Please try again.");
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
                            Login
                        </Typography>

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                variant="outlined"
                                InputLabelProps={{
                                    style: { color: '#333333' },
                                }}
                                sx={{
                                    bgcolor: '#ffffff',
                                    borderRadius: 1,
                                }}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                variant="outlined"
                                InputLabelProps={{
                                    style: { color: '#333333' },
                                }}
                                sx={{
                                    bgcolor: '#ffffff',
                                    borderRadius: 1,
                                }}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{
                                    mt: 3,
                                    mb: 2,
                                    py: 1.5,
                                    bgcolor: '#c05e3c',
                                    '&:hover': {
                                        bgcolor: '#a94e33',
                                    },
                                }}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
                            </Button>
                        </Box>
                    </Paper>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default Login;