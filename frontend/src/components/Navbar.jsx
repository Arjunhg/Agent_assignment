import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Divider,
  ListItemIcon,
  Tooltip,
  Badge,
  useMediaQuery,
  useTheme,
  Container,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Campaign as CampaignIcon,
  Share as ShareIcon,
  CardGiftcard as RewardIcon,
  Email as MessageIcon,
  Analytics as AnalyticsIcon,
  Person as PersonIcon,
  Upload as UploadIcon,
  ExitToApp as LogoutIcon,
  Notifications as NotificationIcon,
} from "@mui/icons-material";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [navMenu, setNavMenu] = useState(null);
  const [userMenu, setUserMenu] = useState(null);

  const handleNavMenuOpen = (event) => setNavMenu(event.currentTarget);
  const handleNavMenuClose = () => setNavMenu(null);

  const handleUserMenuOpen = (event) => setUserMenu(event.currentTarget);
  const handleUserMenuClose = () => setUserMenu(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
    handleUserMenuClose();
  };

  const isActive = (path) => {
    // Check if the current path starts with the provided path
    // This allows for active state in nested routes
    return location.pathname === path || 
      (path !== "/" && location.pathname.startsWith(path));
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleNavMenuClose();
    handleUserMenuClose();
  };

  const navItems = user ? [
    { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon fontSize="small" /> },
    { label: "Campaigns", path: "/campaigns", icon: <CampaignIcon fontSize="small" /> },
    { label: "Referrals", path: "/referrals", icon: <ShareIcon fontSize="small" /> },
    { label: "Rewards", path: "/rewards", icon: <RewardIcon fontSize="small" /> },
    { label: "Messages", path: "/messages", icon: <MessageIcon fontSize="small" /> },
    { label: "Analytics", path: "/analytics", icon: <AnalyticsIcon fontSize="small" /> },
  ] : [];

  const userMenuItems = user ? [
    { label: "My Profile", path: "/profile", icon: <PersonIcon fontSize="small" /> },
    { label: "Add Agent", path: "/add_agent", icon: <PersonIcon fontSize="small" /> },
    { label: "Upload Tasks", path: "/upload_task", icon: <UploadIcon fontSize="small" /> },
    { divider: true },
    { label: "Logout", action: handleLogout, icon: <LogoutIcon fontSize="small" color="error" /> },
  ] : [];

  return (
    <AppBar position="fixed" color="default" elevation={2}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              ReferBiz
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {user && !isMobile && (
            <Box sx={{ display: 'flex', mx: 4 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  color={isActive(item.path) ? "primary" : "inherit"}
                  sx={{
                    mx: 0.5,
                    fontWeight: 500,
                    position: 'relative',
                    '&::after': isActive(item.path) ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '25px',
                      height: '3px',
                      backgroundColor: 'primary.main',
                      borderRadius: '1.5px',
                    } : {},
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Right Side Items */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Notification Icon */}
            {user && (
              <Tooltip title="Notifications">
                <IconButton
                  size="large"
                  aria-label="show new notifications"
                  color="inherit"
                  sx={{ ml: 1 }}
                >
                  <Badge badgeContent={4} color="secondary">
                    <NotificationIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}

            {/* Mobile Menu */}
            {user && isMobile && (
              <>
                <IconButton
                  color="inherit"
                  aria-label="menu"
                  onClick={handleNavMenuOpen}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={navMenu}
                  keepMounted
                  open={Boolean(navMenu)}
                  onClose={handleNavMenuClose}
                  PaperProps={{
                    elevation: 3,
                    sx: { mt: 1.5, width: 200 }
                  }}
                >
                  {navItems.map((item) => (
                    <MenuItem
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      selected={isActive(item.path)}
                      sx={{ 
                        color: isActive(item.path) ? 'primary.main' : 'inherit',
                        fontWeight: isActive(item.path) ? 600 : 400
                      }}
                    >
                      <ListItemIcon>
                        {item.icon}
                      </ListItemIcon>
                      {item.label}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}

            {/* Login/Register or User Menu */}
            {!user ? (
              <Box>
                <Button 
                  component={Link} 
                  to="/login" 
                  color="inherit"
                  sx={{ mx: 1 }}
                >
                  Login
                </Button>
                <Button 
                  component={Link} 
                  to="/register" 
                  variant="contained" 
                  color="primary"
                  sx={{ ml: 1 }}
                >
                  Register
                </Button>
              </Box>
            ) : (
              <>
                <Tooltip title="Account settings">
                  <IconButton
                    onClick={handleUserMenuOpen}
                    size="small"
                    sx={{ ml: 2 }}
                    aria-controls={Boolean(userMenu) ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={Boolean(userMenu) ? 'true' : undefined}
                  >
                    <Avatar 
                      sx={{ 
                        width: 38, 
                        height: 38,
                        bgcolor: 'primary.main',
                        fontSize: '1rem',
                        fontWeight: 600
                      }}
                    >
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={userMenu}
                  id="account-menu"
                  open={Boolean(userMenu)}
                  onClose={handleUserMenuClose}
                  onClick={handleUserMenuClose}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                      mt: 1.5,
                      width: 220,
                      '& .MuiAvatar-root': {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <Box sx={{ px: 2, py: 1, pb: 0 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {user.email}
                    </Typography>
                  </Box>
                  <Divider />
                  {userMenuItems.map((item, index) => 
                    item.divider ? (
                      <Divider key={`divider-${index}`} />
                    ) : (
                      <MenuItem 
                        key={item.label} 
                        onClick={item.action || (() => handleNavigate(item.path))}
                      >
                        <ListItemIcon>
                          {item.icon}
                        </ListItemIcon>
                        {item.label}
                      </MenuItem>
                    )
                  )}
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
