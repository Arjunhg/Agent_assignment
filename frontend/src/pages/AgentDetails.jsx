import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
    Avatar,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    TextField,
    MenuItem
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { agentService, contactService } from '../services/api';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { format } from 'date-fns';
import LinearProgress from '@mui/material/LinearProgress';

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
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskStats, setTaskStats] = useState(null);
    const [statusForm, setStatusForm] = useState({
        status: '',
        completionNotes: '',
        followUpStatus: 'none',
        followUpDate: null,
        followUpNotes: ''
    });
    const navigate = useNavigate();

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

    useEffect(() => {
        fetchAgentDetails();
    }, [id]);

    useEffect(() => {
        fetchTaskStats();
    }, []);

    const fetchTaskStats = async () => {
        try {
            if (!agent || !agent.tasks) {
                return;
            }
            
            // Get all tasks for the current agent
            const agentTasks = agent.tasks;
            
            // Calculate statistics for the current agent's tasks
            const stats = [
                { _id: 'pending', count: agentTasks.filter(task => !task.status || task.status === 'pending').length },
                { _id: 'in_progress', count: agentTasks.filter(task => task.status === 'in_progress').length },
                { _id: 'completed', count: agentTasks.filter(task => task.status === 'completed').length },
                { _id: 'failed', count: agentTasks.filter(task => task.status === 'failed').length }
            ];

            const totalTasks = agentTasks.length;
            
            setTaskStats({
                stats,
                totalTasks
            });
        } catch (error) {
            console.error('Error calculating task stats:', error);
        }
    };

    useEffect(() => {
        if (agent) {
            fetchTaskStats();
        }
    }, [agent]);

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await agentService.deleteAgent(agent._id);
            navigate('/dashboard');
        } catch (error) {
            console.error('Error deleting agent:', error);
            // You might want to show an error message to the user here
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
    };

    const handleStatusClick = (task) => {
        setSelectedTask(task);
        setStatusForm({
            status: task.status || 'pending',
            completionNotes: task.completionNotes || '',
            followUpStatus: task.followUpStatus || 'none',
            followUpDate: task.followUpDate ? new Date(task.followUpDate) : null,
            followUpNotes: task.followUpNotes || ''
        });
        setStatusDialogOpen(true);
    };

    const handleStatusUpdate = async () => {
        try {
            await contactService.updateTaskStatus(selectedTask._id, statusForm);
            fetchAgentDetails();
            fetchTaskStats();
            setStatusDialogOpen(false);
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'success';
            case 'in_progress':
                return 'primary';
            case 'failed':
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'completed':
                return 'Completed';
            case 'in_progress':
                return 'In Progress';
            case 'failed':
                return 'Failed';
            default:
                return 'Pending';
        }
    };

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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography
                        variant="h5"
                        component="h3"
                        color="primary"
                        fontWeight="bold"
                    >
                        Agent Details
                    </Typography>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteClick}
                        startIcon={<DeleteIcon />}
                    >
                        Delete Agent
                    </Button>
                </Box>

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

                {/* Add Task Stats Section */}
                {taskStats && (
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Task Statistics
                        </Typography>
                        <Grid container spacing={2}>
                            {taskStats.stats.map((stat) => (
                                <Grid item xs={12} sm={6} md={3} key={stat._id}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h4" color="primary">
                                            {stat.count}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {getStatusLabel(stat._id)}
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={(stat.count / taskStats.totalTasks) * 100}
                                            sx={{ mt: 1 }}
                                        />
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                )}

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
                                            <Grid item xs={12}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                    <Chip
                                                        label={getStatusLabel(task.status)}
                                                        color={getStatusColor(task.status)}
                                                        size="small"
                                                    />
                                                    <Button
                                                        size="small"
                                                        onClick={() => handleStatusClick(task)}
                                                        startIcon={<EditIcon />}
                                                    >
                                                        Update Status
                                                    </Button>
                                                </Box>
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

                                        {task.completionNotes && (
                                            <>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    Completion Notes
                                                </Typography>
                                                <Paper
                                                    variant="outlined"
                                                    sx={{
                                                        p: 2,
                                                        backgroundColor: 'rgba(76, 175, 80, 0.03)',
                                                        border: '1px solid rgba(76, 175, 80, 0.1)',
                                                        mb: 2
                                                    }}
                                                >
                                                    <Typography variant="body2">
                                                        {task.completionNotes}
                                                    </Typography>
                                                </Paper>
                                            </>
                                        )}

                                        <Typography variant="body2" color="text.secondary">
                                            Assigned on {format(new Date(task.createdAt), 'MMMM d, yyyy')}
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

                <Dialog
                    open={deleteDialogOpen}
                    onClose={handleDeleteCancel}
                    aria-labelledby="delete-dialog-title"
                    aria-describedby="delete-dialog-description"
                >
                    <DialogTitle id="delete-dialog-title">
                        Delete Agent
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="delete-dialog-description">
                            Are you sure you want to delete this agent? This action cannot be undone.
                            All contacts assigned to this agent will be unassigned.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDeleteCancel} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Status Update Dialog */}
                <Dialog
                    open={statusDialogOpen}
                    onClose={() => setStatusDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Update Task Status</DialogTitle>
                    <DialogContent>
                        <Box sx={{ pt: 2 }}>
                            <TextField
                                select
                                fullWidth
                                label="Status"
                                value={statusForm.status}
                                onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                                sx={{ mb: 2 }}
                            >
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="in_progress">In Progress</MenuItem>
                                <MenuItem value="completed">Completed</MenuItem>
                                <MenuItem value="failed">Failed</MenuItem>
                            </TextField>

                            {statusForm.status === 'completed' && (
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Completion Notes (Required)"
                                    placeholder="Describe what was done to complete this task..."
                                    value={statusForm.completionNotes}
                                    onChange={(e) => setStatusForm({ ...statusForm, completionNotes: e.target.value })}
                                    sx={{ mb: 2 }}
                                    required
                                />
                            )}

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Follow-up Information (Optional)
                            </Typography>

                            <TextField
                                select
                                fullWidth
                                label="Follow-up Status"
                                value={statusForm.followUpStatus}
                                onChange={(e) => setStatusForm({ ...statusForm, followUpStatus: e.target.value })}
                                sx={{ mb: 2 }}
                            >
                                <MenuItem value="none">No Follow-up Required</MenuItem>
                                <MenuItem value="scheduled">Schedule Follow-up</MenuItem>
                                <MenuItem value="completed">Follow-up Completed</MenuItem>
                                <MenuItem value="cancelled">Follow-up Cancelled</MenuItem>
                            </TextField>

                            {statusForm.followUpStatus === 'scheduled' && (
                                <TextField
                                    fullWidth
                                    type="datetime-local"
                                    label="Follow-up Date"
                                    value={statusForm.followUpDate ? format(statusForm.followUpDate, "yyyy-MM-dd'T'HH:mm") : ''}
                                    onChange={(e) => setStatusForm({ ...statusForm, followUpDate: new Date(e.target.value) })}
                                    sx={{ mb: 2 }}
                                    InputLabelProps={{ shrink: true }}
                                />
                            )}

                            {(statusForm.followUpStatus === 'scheduled' || statusForm.followUpStatus === 'completed') && (
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Follow-up Notes"
                                    placeholder="Describe what needs to be done in the follow-up..."
                                    value={statusForm.followUpNotes}
                                    onChange={(e) => setStatusForm({ ...statusForm, followUpNotes: e.target.value })}
                                />
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleStatusUpdate} variant="contained" color="primary">
                            Update Status
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </ThemeProvider>
    );
};

export default AgentDetails;