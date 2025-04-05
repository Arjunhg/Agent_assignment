import { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import {
    Box,
    Typography,
    Button,
    Paper,
    Container,
    Alert,
    CircularProgress,
    createTheme,
    ThemeProvider,
    IconButton,
    Tabs,
    Tab,
    TextField,
    Stack,
    Divider
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import styled from "@emotion/styled";
import { uploadService } from "../services/api";

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

// Styled component for the file input
const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const TabPanel = ({ children, value, index }) => (
    <div role="tabpanel" hidden={value !== index}>
        {value === index && (
            <Box sx={{ p: 3 }}>
                {children}
            </Box>
        )}
    </div>
);

const UploadFile = () => {
    const [file, setFile] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("error");
    const [activeTab, setActiveTab] = useState(0);
    const [directContact, setDirectContact] = useState({
        firstName: "",
        phone: "",
        notes: ""
    });

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        // Clear messages when switching tabs
        setMessage("");
        setMessageType("error");
    };

    const handleFileChange = async (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;

        const fileExt = selectedFile.name.split('.').pop().toLowerCase();
        if (!['csv', 'xlsx', 'xls'].includes(fileExt)) {
            setMessage('Please select a CSV or Excel file');
            setMessageType('error');
            return;
        }

        setFile(selectedFile);
        await parseFile(selectedFile);
    };

    const parseFile = async (file) => {
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            // Map the data to our expected format
            const formattedContacts = jsonData.map(row => ({
                firstName: row.firstName || row.FirstName || row.name || row.Name || '',
                email: row.email || row.Email || '',
                phone: row.phone || row.Phone || '',
                notes: row.notes || row.Notes || ''
            })).filter(contact => contact.firstName && (contact.email || contact.phone));

            setContacts(formattedContacts);
            console.log('Parsed contacts:', formattedContacts);
            return formattedContacts;
        } catch (error) {
            console.error('Error parsing file:', error);
            setMessage('Error parsing file. Please check the format.');
            setMessageType('error');
            return [];
        }
    };

    const handleContactChange = (e) => {
        const { name, value } = e.target;
        setDirectContact(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddContact = async () => {
        if (!directContact.firstName || !directContact.phone) {
            setMessage("Name and phone number are required.");
            setMessageType("error");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await uploadService.uploadCSV({
                contacts: [directContact],
                fileName: "direct_entry"
            });

            if (response.data.success) {
                setMessage("Contact added successfully!");
                setMessageType("success");
                setDirectContact({
                    firstName: "",
                    phone: "",
                    notes: ""
                });
            } else {
                setMessage("Failed to add contact. " + response.data.message);
                setMessageType("error");
            }
        } catch (error) {
            console.error('Add contact error:', error);
            setMessage("Error adding contact: " + (error.response?.data?.message || error.message));
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async () => {
        if (contacts.length === 0) {
            setMessage('No contacts to upload');
            setMessageType('error');
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await uploadService.uploadCSV({
                contacts: contacts,
                fileName: file?.name || 'direct_entry'
            });

            if (response.data.success) {
                setMessage(`Successfully uploaded ${response.data.data.totalContacts} contacts!`);
                setMessageType('success');
                setFile(null);
                setContacts([]);
            } else {
                setMessage(response.data.message || 'Upload failed');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setMessage(error.response?.data?.message || 'Error uploading contacts');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#ffffff', py: 4 }}>
                <Container maxWidth="sm">
                    <Paper elevation={2} sx={{ borderRadius: 2, bgcolor: '#f8f0ed', border: '1px solid #e0e0e0' }}>
                        <Typography variant="h4" component="h1" align="center" sx={{ pt: 4, fontWeight: "bold", color: "#333333" }}>
                            Add Contacts
                        </Typography>

                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
                            <Tabs value={activeTab} onChange={handleTabChange} centered>
                                <Tab label="File Upload" icon={<CloudUploadIcon />} iconPosition="start" />
                                <Tab label="Add Single Contact" icon={<PersonAddIcon />} iconPosition="start" />
                            </Tabs>
                        </Box>

                        <TabPanel value={activeTab} index={0}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Button
                                    component="label"
                                    variant="contained"
                                    startIcon={<CloudUploadIcon />}
                                    sx={{
                                        bgcolor: '#c05e3c',
                                        '&:hover': { bgcolor: '#a94e33' },
                                        mb: 2
                                    }}
                                >
                                    Select CSV File
                                    <VisuallyHiddenInput
                                        type="file"
                                        accept=".csv, .xlsx, .xls"
                                        onChange={handleFileChange}
                                    />
                                </Button>

                                {file && (
                                    <Typography variant="body2" color="#333333" sx={{ mb: 1 }}>
                                        Selected: {file.name}
                                    </Typography>
                                )}

                                {contacts.length > 0 && (
                                    <Typography variant="body1" color="#333333" sx={{ mb: 2 }}>
                                        Total Contacts: {contacts.length}
                                    </Typography>
                                )}

                                <Button
                                    onClick={handleUpload}
                                    disabled={loading || contacts.length === 0}
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        mt: 2,
                                        py: 1.5,
                                        bgcolor: '#c05e3c',
                                        '&:hover': { bgcolor: '#a94e33' },
                                        '&.Mui-disabled': {
                                            bgcolor: '#e0e0e0',
                                            color: '#999999'
                                        }
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : "Upload"}
                                </Button>
                            </Box>
                        </TabPanel>

                        <TabPanel value={activeTab} index={1}>
                            <Stack spacing={3}>
                                <TextField
                                    label="Name"
                                    name="firstName"
                                    value={directContact.firstName}
                                    onChange={handleContactChange}
                                    fullWidth
                                    required
                                    sx={{ bgcolor: '#ffffff', borderRadius: 1 }}
                                />

                                <TextField
                                    label="Phone Number"
                                    name="phone"
                                    value={directContact.phone}
                                    onChange={handleContactChange}
                                    fullWidth
                                    required
                                    sx={{ bgcolor: '#ffffff', borderRadius: 1 }}
                                />

                                <TextField
                                    label="Notes (Optional)"
                                    name="notes"
                                    value={directContact.notes}
                                    onChange={handleContactChange}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    sx={{ bgcolor: '#ffffff', borderRadius: 1 }}
                                />

                                <Button
                                    onClick={handleAddContact}
                                    disabled={loading}
                                    variant="contained"
                                    fullWidth
                                    startIcon={<PersonAddIcon />}
                                    sx={{
                                        py: 1.5,
                                        bgcolor: '#c05e3c',
                                        '&:hover': { bgcolor: '#a94e33' },
                                        '&.Mui-disabled': {
                                            bgcolor: '#e0e0e0',
                                            color: '#999999'
                                        }
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : "Add Contact"}
                                </Button>
                            </Stack>
                        </TabPanel>

                        {message && (
                            <Box sx={{ p: 3, pt: 0 }}>
                                <Alert severity={messageType} sx={{ width: '100%' }}>
                                    {message}
                                </Alert>
                            </Box>
                        )}
                    </Paper>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default UploadFile;