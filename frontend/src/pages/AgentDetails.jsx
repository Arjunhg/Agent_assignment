
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
    Typography,
    Paper,
    CircularProgress,
    Alert,
    Box,
    Container,
    Divider,
    Chip,
    Grid,
    Card,
    CardContent,
    ThemeProvider,
    createTheme,
    Avatar
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Create custom theme with the provided color palette
const theme = createTheme({
    palette: {
        primary: {
            main: "#c05e3c",
        },
        secondary: {
            main: "#f8f0ed",
        },
        text: {
            primary: "#333333",
        },
        success: {
            main: "#4caf50",
        },
        warning: {
            main: "#ff9800",
        },
        divider: "#e0e0e0",
        background: {
            default: "#ffffff",
            paper: "#ffffff",
        },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    margin: '16px 0',
                },
            },
        },
    },
});

const AgentDetails = () => {
    const { id } = useParams();
    const [agent, setAgent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAgentDetails = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${BACKEND_URL}/api/agents/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data.success) {
                    setAgent(response.data.data);
                } else {
                    setError("Failed to fetch agent details.");
                }
            } catch (err) {
                setError(err.response?.data?.message || "Error fetching agent details.");
            } finally {
                setLoading(false);
            }
        };

        fetchAgentDetails();
    }, [id]);

    if (loading) {
        return (
            <ThemeProvider theme={theme}>
                <Container maxWidth="md" sx={{ py: 4 }}>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                        <CircularProgress color="primary" />
                    </Box>
                </Container>
            </ThemeProvider>
        );
    }

    if (error) {
        return (
            <ThemeProvider theme={theme}>
                <Container maxWidth="md" sx={{ py: 4 }}>
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        {error}
                    </Alert>
                </Container>
            </ThemeProvider>
        );
    }

    // Get agent initials for avatar
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Typography
                    variant="h4"
                    component="h2"
                    color="primary"
                    fontWeight="bold"
                    gutterBottom
                >
                    Agent Details
                </Typography>

                {/* Improved Agent Details Card */}
                <Paper
                    elevation={3}
                    sx={{
                        p: 0,
                        mb: 4,
                        overflow: 'hidden',
                        border: `1px solid ${theme.palette.divider}`,
                    }}
                >
                    <Box
                        sx={{
                            backgroundColor: theme.palette.primary.main,
                            py: 2,
                            px: 3,
                            color: 'white'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                                sx={{
                                    bgcolor: '#FFF',
                                    color: theme.palette.primary.main,
                                    width: 56,
                                    height: 56,
                                    mr: 2,
                                    fontWeight: 'bold'
                                }}
                            >
                                {getInitials(agent.name)}
                            </Avatar>
                            <Box>
                                <Typography variant="h5" fontWeight="medium">
                                    {agent.name}
                                </Typography>
                                <Typography variant="body2">
                                    Agent ID: {id.substring(0, 8)}...
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ p: 3, backgroundColor: theme.palette.secondary.main }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Email Address
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {agent.email}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Mobile Number
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {agent.mobile}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Created On
                                    </Typography>
                                    <Typography variant="body1">
                                        {new Date(agent.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Tasks Count
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Chip
                                            label={agent.tasks.length}
                                            color={agent.tasks.length > 0 ? "success" : "warning"}
                                            size="small"
                                            sx={{ mr: 1 }}
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                            {agent.tasks.length === 1 ? 'task' : 'tasks'} assigned
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Typography
                        variant="h5"
                        component="h3"
                        color="primary"
                        fontWeight="bold"
                    >
                        Tasks Assigned
                    </Typography>
                </Box>

                {agent.tasks.length > 0 ? (
                    <Grid container spacing={2}>
                        {agent.tasks.map((task) => (
                            <Grid item xs={12} key={task._id}>
                                <Card
                                    sx={{
                                        border: `1px solid ${theme.palette.divider}`,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                                    }}
                                >
                                    <CardContent>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    Client Name
                                                </Typography>
                                                <Typography variant="body1" fontWeight="medium" gutterBottom>
                                                    {task.firstName}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    Phone Number
                                                </Typography>
                                                <Typography variant="body1" fontWeight="medium" gutterBottom>
                                                    {task.phone}
                                                </Typography>
                                            </Grid>
                                        </Grid>

                                        <Divider sx={{ my: 2 }} />

                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Notes
                                        </Typography>
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                backgroundColor: 'rgba(192, 94, 60, 0.03)',
                                                border: '1px solid rgba(192, 94, 60, 0.1)',
                                                mb: 2
                                            }}
                                        >
                                            <Typography variant="body2">
                                                {task.notes}
                                            </Typography>
                                        </Paper>

                                        <Typography variant="body2" color="text.secondary">
                                            Assigned on {new Date(task.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 3,
                            textAlign: 'center',
                            backgroundColor: theme.palette.secondary.main,
                            border: `1px solid ${theme.palette.divider}`
                        }}
                    >
                        <Typography variant="body1" color="text.secondary">
                            No tasks assigned to this agent.
                        </Typography>
                    </Paper>
                )}
            </Container>
        </ThemeProvider>
    );
};

export default AgentDetails;