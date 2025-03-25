import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthProvider";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddAgent from "./pages/AddAgent";
import UploadFile from "./pages/UploadFile";
import AgentDetails from "./pages/AgentDetails";
import CampaignList from "./pages/campaigns/CampaignList";
import CampaignCreate from "./pages/campaigns/CampaignCreate";
import CampaignEdit from "./pages/campaigns/CampaignEdit";
import CampaignDetails from "./pages/campaigns/CampaignDetails";
import ReferralList from "./pages/referrals/ReferralList";
import ReferralCreate from "./pages/referrals/ReferralCreate";
import ReferralDetails from "./pages/referrals/ReferralDetails";
import ReferralLanding from "./pages/referrals/ReferralLanding";
import RewardList from "./pages/rewards/RewardList";
import RewardDetails from "./pages/rewards/RewardDetails";
import MessageList from "./pages/messages/MessageList";
import MessageCreate from "./pages/messages/MessageCreate";
import AnalyticsDashboard from "./pages/analytics/AnalyticsDashboard";
import CampaignAnalytics from "./pages/analytics/CampaignAnalytics";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import { Box } from "@mui/material";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            paddingTop: "64px"
          }}
        >
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/refer/:referralCode" element={<ReferralLanding />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            
            {/* Agent routes */}
            <Route path="/add_agent" element={<ProtectedRoute><AddAgent /></ProtectedRoute>} />
            <Route path="/agent/:id" element={<ProtectedRoute><AgentDetails /></ProtectedRoute>} />
            <Route path="/upload_task" element={<ProtectedRoute><UploadFile /></ProtectedRoute>} />
            
            {/* Campaign routes */}
            <Route path="/campaigns" element={<ProtectedRoute><CampaignList /></ProtectedRoute>} />
            <Route path="/campaigns/new" element={<ProtectedRoute><CampaignCreate /></ProtectedRoute>} />
            <Route path="/campaigns/:id" element={<ProtectedRoute><CampaignDetails /></ProtectedRoute>} />
            <Route path="/campaigns/:id/edit" element={<ProtectedRoute><CampaignEdit /></ProtectedRoute>} />
            
            {/* Referral routes */}
            <Route path="/referrals" element={<ProtectedRoute><ReferralList /></ProtectedRoute>} />
            <Route path="/referrals/new" element={<ProtectedRoute><ReferralCreate /></ProtectedRoute>} />
            <Route path="/referrals/:id" element={<ProtectedRoute><ReferralDetails /></ProtectedRoute>} />
            
            {/* Reward routes */}
            <Route path="/rewards" element={<ProtectedRoute><RewardList /></ProtectedRoute>} />
            <Route path="/rewards/:id" element={<ProtectedRoute><RewardDetails /></ProtectedRoute>} />
            
            {/* Message routes */}
            <Route path="/messages" element={<ProtectedRoute><MessageList /></ProtectedRoute>} />
            <Route path="/messages/new" element={<ProtectedRoute><MessageCreate /></ProtectedRoute>} />
            
            {/* Analytics routes */}
            <Route path="/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
            <Route path="/analytics/campaign/:id" element={<ProtectedRoute><CampaignAnalytics /></ProtectedRoute>} />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Box>
        <Footer />
      </Box>
    </Router>
  );
};

export default App;